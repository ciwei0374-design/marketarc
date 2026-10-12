import OpenAI from "openai";
import { ZodError, type ZodType } from "zod";
import type { AnalysisStory } from "@/types/analysis";
import type { ResearchBrief } from "@/types/research-brief";
import { researchBriefJsonSchema, parseResearchBrief } from "../research-brief-schema";
import { RESEARCH_ANALYST_SYSTEM_PROMPT, buildResearchAnalystPrompt } from "../prompts/research-analyst";
import { PARTIAL_STORY_A_SYSTEM_PROMPT, PARTIAL_STORY_B_SYSTEM_PROMPT, buildPartialStoryPrompt } from "../prompts/partial-story-composer";
import { mergeAnalysisStory, partialStoryAJsonSchema, partialStoryASchema, partialStoryBJsonSchema, partialStoryBSchema, type PartialStoryA, type PartialStoryB } from "../partial-story-schema";
import type { AIProvider, ComposeAnalysisInput, GenerateResearchBriefInput } from "../types";
import { researchPlanSchema, type ResearchPlan } from "@/services/research/research-plan";
import { normalizeModelJson, parseModelJson } from "../model-json";

type ProviderConfig = { baseURL: string; apiKey: string };
type RequestOptions = { maxTokens: number; thinkingDisabled?: boolean; timeoutMs?: number };
type CompatibleChatParams = OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
  thinking?: { type: "disabled" };
};
const isDevelopment = process.env.NODE_ENV === "development";

class AIOutputBudgetExhaustedError extends Error {
  readonly code = "AI_OUTPUT_BUDGET_EXHAUSTED";

  constructor() {
    super("AI_OUTPUT_BUDGET_EXHAUSTED");
    this.name = "AIOutputBudgetExhaustedError";
  }
}

function isOutputBudgetExhausted(error: unknown): error is AIOutputBudgetExhaustedError {
  return error instanceof AIOutputBudgetExhaustedError;
}

function log(stage: string, message: string, detail?: unknown) {
  if (!isDevelopment) return;
  const prefix = `[${stage}] ${message}`;
  if (detail === undefined) console.log(prefix);
  else console.log(prefix, detail);
}

function safeProviderError(error: unknown, apiKey: string) {
  const status = error && typeof error === "object" && "status" in error ? error.status : "unavailable";
  return {
    status,
    type: error instanceof Error ? error.name : typeof error,
    message: (error instanceof Error ? error.message : String(error)).replaceAll(apiKey, "[REDACTED]"),
  };
}

function normalizePartialStoryLimits(value: unknown, kind: "A" | "B") {
  if (kind !== "B" || !value || typeof value !== "object") return value;
  const mentalModel = "mentalModel" in value ? value.mentalModel : undefined;
  if (!mentalModel || typeof mentalModel !== "object" || !("tags" in mentalModel) || !Array.isArray(mentalModel.tags)) {
    return value;
  }
  mentalModel.tags = mentalModel.tags.slice(0, 7);
  return value;
}

function finishReasonOf(completion: OpenAI.Chat.Completions.ChatCompletion) {
  return completion.choices[0]?.finish_reason ?? "missing";
}

function truncated(finishReason: string) {
  const value = finishReason.toLowerCase();
  return value === "length" || value.includes("max_token") || value.includes("token_limit");
}

function issuesOf(error: unknown) {
  return error instanceof ZodError
    ? error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code, message: issue.message }))
    : { type: error instanceof Error ? error.name : typeof error, message: error instanceof Error ? error.message : String(error) };
}

function isResearchBriefShape(value: unknown) {
  return Boolean(value && typeof value === "object" && "question" in value && "thesis" in value && "whatHappened" in value && "sourcesUsed" in value);
}

function statusOf(error: unknown) {
  return error && typeof error === "object" && "status" in error && typeof error.status === "number" ? error.status : undefined;
}

function retryAfterMs(error: unknown) {
  if (!error || typeof error !== "object" || !("headers" in error) || !(error.headers instanceof Headers)) return undefined;
  const value = error.headers.get("retry-after");
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

function fallbackRetryDelay() {
  return 2_000 + Math.random() * 2_000;
}

export class OpenAICompatibleProvider implements AIProvider {
  readonly id = "openai-compatible";
  private readonly client: OpenAI;
  private transient429Count = 0;

  constructor(private readonly config: ProviderConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL, timeout: 120_000, maxRetries: 0 });
  }

  private async request(model: string, messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], stage: string, options: RequestOptions) {
    const startedAt = performance.now();
    try {
      log(stage, `input chars: ${messages.reduce((total, message) => total + (typeof message.content === "string" ? message.content.length : 0), 0)}`);
      log(stage, `thinking: ${options.thinkingDisabled ? "disabled" : "enabled/default"}`);
      const params: CompatibleChatParams = {
        model,
        messages,
        max_tokens: options.maxTokens,
        ...(options.thinkingDisabled ? { thinking: { type: "disabled" as const } } : {}),
      };
      let completion: OpenAI.Chat.Completions.ChatCompletion | undefined;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          completion = await this.client.chat.completions.create(params, options.timeoutMs ? { timeout: options.timeoutMs, maxRetries: 0 } : undefined);
          break;
        } catch (error) {
          const status = statusOf(error);
          if (status === 429) this.transient429Count += 1;
          if (![429, 502, 503, 504].includes(status ?? 0) || attempt === 1) throw error;
          const retryNumber = attempt + 1;
          const waitMs = Math.min(status === 429 ? 30_000 : 10_000, retryAfterMs(error) ?? fallbackRetryDelay());
          log("provider", "transient retry", { stage, status, retry: retryNumber, wait_ms: Math.round(waitMs) });
          if (!isDevelopment) console.warn("[provider] transient retry", { stage, status, retry: retryNumber, waitMs: Math.round(waitMs) });
          log("timing", `retry wait: ${Math.round(waitMs)}ms`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
      }
      if (!completion) throw new Error("AI provider request did not complete");
      const finishReason = finishReasonOf(completion);
      log(stage, `duration: ${Math.round(performance.now() - startedAt)}ms`);
      log(stage, `finish_reason: ${finishReason}`);
      if (!isDevelopment) console.info("[provider] request complete", { stage, durationMs: Math.round(performance.now() - startedAt), finishReason });
      const content = completion.choices[0]?.message.content;
      if (!content) {
        if (truncated(finishReason)) {
          log("ai-provider", "output budget exhausted", {
            status: 200,
            finish_reason: finishReason,
            content_empty: true,
            error_type: "output_budget_exhausted",
          });
          throw new AIOutputBudgetExhaustedError();
        }
        throw new Error("AI provider returned an empty response");
      }
      log(stage, `output chars: ${content.length}`);
      if (completion.usage) {
        log(stage, "usage", {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens,
        });
      }
      return { content, finishReason };
    } catch (error) {
      log(stage, `duration: ${Math.round(performance.now() - startedAt)}ms`);
      log(stage, "provider request failed", safeProviderError(error, this.config.apiKey));
      if (!isDevelopment) console.error("[provider] request failed", { stage, durationMs: Math.round(performance.now() - startedAt), ...safeProviderError(error, this.config.apiKey) });
      throw error;
    }
  }

  async generateResearchBrief({ question, research, model }: GenerateResearchBriefInput): Promise<ResearchBrief> {
    const schema = JSON.stringify(researchBriefJsonSchema);
    log("research-analyst", `model: ${model}`);
    const primaryMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: RESEARCH_ANALYST_SYSTEM_PROMPT },
      { role: "user", content: buildResearchAnalystPrompt(question, research.context, schema) },
    ];
    const compactMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: `${RESEARCH_ANALYST_SYSTEM_PROMPT}\n\n格式修复：只输出一个从 { 开始、以 } 结束的完整 JSON 对象。任何英文思考、说明句、第二个对象或半写的对象都会使任务失败；不要输出它们。` },
      { role: "user", content: buildResearchAnalystPrompt(question, research.context, schema, true) },
    ];
    const researchThinkingDisabled = process.env.AI_RESEARCH_THINKING?.trim().toLowerCase() === "disabled";
    let fallbackUsed = false;
    let primary: { content: string; finishReason: string };
    try {
      primary = await this.request(model, primaryMessages, "research-analyst", {
        maxTokens: 4096,
        thinkingDisabled: researchThinkingDisabled,
      });
    } catch (error) {
      if (!isOutputBudgetExhausted(error)) throw error;
      fallbackUsed = true;
      log("research-analyst", "stage1_fallback_reason: output_budget_exhausted");
      log("research-analyst", "stage1_fallback_thinking: disabled");
      primary = await this.request(
        model,
        researchThinkingDisabled ? compactMessages : primaryMessages,
        "research-analyst",
        { maxTokens: 4096, thinkingDisabled: true },
      );
    }

    if (!truncated(primary.finishReason)) {
      try {
        const brief = parseResearchBrief(parseModelJson(primary.content, isResearchBriefShape));
        log("research-analyst", "success");
        return brief;
      } catch (error) {
        log("research-analyst", "parse or validation failed", issuesOf(error));
      }
    }

    if (fallbackUsed) throw new Error(`ResearchBrief fallback was truncated: ${primary.finishReason}`);

    log("research-analyst", "compact retry started");
    if (!isDevelopment) console.warn("[research-analyst] compact retry started");
    const compact = await this.request(model, compactMessages, "research-analyst", {
      maxTokens: 4096,
      thinkingDisabled: true,
    });
    if (truncated(compact.finishReason)) throw new Error(`ResearchBrief compact retry was truncated: ${compact.finishReason}`);
    let brief: ResearchBrief;
    try {
      brief = parseResearchBrief(parseModelJson(compact.content, isResearchBriefShape));
    } catch (error) {
      if (!isDevelopment) {
        const normalized = normalizeModelJson(compact.content);
        const match = error instanceof SyntaxError ? error.message.match(/position (\d+)/) : null;
        const position = match ? Number(match[1]) : 0;
        console.error("[research-analyst] compact validation failed", {
          finishReason: compact.finishReason,
          outputLength: normalized.length,
          type: error instanceof Error ? error.name : typeof error,
          message: (error instanceof Error ? error.message : String(error)).replaceAll(this.config.apiKey, "[REDACTED]"),
          excerpt: normalized.slice(Math.max(0, position - 32), position + 64).replaceAll(this.config.apiKey, "[REDACTED]"),
        });
      }
      throw error;
    }
    log("research-analyst", "success");
    return brief;
  }

  async generateResearchPlan(question: string, model: string): Promise<ResearchPlan> {
    const schema = JSON.stringify(researchPlanSchema.toJSONSchema());
    log("research-planner", `model: ${model}`);
    const response = await this.request(model, [
      {
        role: "system",
        content: "你是轻量财经检索规划器。判断问题最应该查哪些原始机构，再规划少量背景搜索。优先央行、政府、统计机构、监管机构、交易所、公司 IR/公告和国际组织。不要穷举机构，不要写文章。ONLY return valid JSON；no Markdown；primaryTargets<=4；primaryQueries<=3；contextQueries<=2。domain 只写域名。",
      },
      {
        role: "user",
        content: `财经问题：${question}\n\nResearchPlan JSON Schema：\n${schema}\n\n输出紧凑完整 JSON。Primary query 应与 primaryTarget 顺序对应；context query 用于寻找 Reuters、Financial Times、Bloomberg 等高质量市场背景。`,
      },
    ], "research-planner", { maxTokens: 900, thinkingDisabled: true, timeoutMs: 10_000 });
    if (truncated(response.finishReason)) throw new Error(`Research planner was truncated: ${response.finishReason}`);
    const plan = researchPlanSchema.parse(parseModelJson(response.content));
    if (plan.primaryTargets.some((target) => !/^[a-z0-9.-]+$/i.test(target.domain))) throw new Error("Research planner returned an invalid domain");
    log("research-planner", "success");
    return plan;
  }

  private async generatePartial<T>(input: {
    kind: "A" | "B";
    question: string;
    brief: ResearchBrief;
    model: string;
    systemPrompt: string;
    jsonSchema: unknown;
    schema: ZodType<T>;
  }): Promise<T> {
    const stage = `story-${input.kind.toLowerCase()}`;
    const startedAt = performance.now();
    log(stage, `model: ${input.model}`);
    const schemaText = JSON.stringify(input.jsonSchema);

    const run = (retry: boolean) => this.request(input.model, [
      { role: "system", content: input.systemPrompt },
      { role: "user", content: buildPartialStoryPrompt(input.kind, input.question, input.brief, schemaText, retry) },
    ], stage, { maxTokens: retry ? 3200 : 3500, thinkingDisabled: true });

    let retried = false;
    let response = await run(false);
    try {
      if (truncated(response.finishReason)) throw new Error(`PartialStory${input.kind} was truncated: ${response.finishReason}`);
      const parsed = input.schema.parse(normalizePartialStoryLimits(parseModelJson(response.content), input.kind));
      log(stage, "validation success");
      log(stage, "retry: false");
      log("timing", `story${input.kind}: ${Math.round(performance.now() - startedAt)}ms`);
      return parsed;
    } catch (error) {
      log(stage, "parse or validation failed", issuesOf(error));
      retried = true;
      log(stage, "retry started");
      if (!isDevelopment) console.warn(`[${stage}] validation retry started`);
      response = await run(true);
      if (truncated(response.finishReason)) throw new Error(`PartialStory${input.kind} retry was truncated: ${response.finishReason}`);
      let retryJson: unknown;
      try {
        retryJson = parseModelJson(response.content);
      } catch (error) {
        if (isDevelopment && error instanceof SyntaxError) {
          const match = error.message.match(/position (\d+)/);
          const position = match ? Number(match[1]) : 0;
          const normalizedRetryContent = normalizeModelJson(response.content);
          console.log(
            `[${stage}] normalized JSON error excerpt`,
            JSON.stringify(normalizedRetryContent.slice(Math.max(0, position - 40), position + 80)),
          );
          console.log(`[${stage}] normalized JSON error point`, {
            position,
            character: JSON.stringify(normalizedRetryContent[position]),
            code: normalizedRetryContent.charCodeAt(position),
            nearbyCodes: Array.from(normalizedRetryContent.slice(position - 3, position + 4)).map((character) =>
              character.charCodeAt(0),
            ),
          });
        }
        throw error;
      }
      const parsed = input.schema.parse(normalizePartialStoryLimits(retryJson, input.kind));
      log(stage, "validation success");
      log(stage, `retry: ${retried}`);
      log("timing", `story${input.kind}: ${Math.round(performance.now() - startedAt)}ms`);
      return parsed;
    }
  }

  async composeAnalysis({ question, brief, model, onStoryAStarted, onStoryACompleted, onStoryBStarted, onStoryBCompleted }: ComposeAnalysisInput): Promise<AnalysisStory> {
    const wallStartedAt = performance.now();
    const concurrency = Math.max(1, Number.parseInt(process.env.AI_MAX_CONCURRENCY?.trim() || "1", 10) || 1);
    log("story-composer", `concurrency: ${concurrency}`);
    const generateA = async () => {
      await onStoryAStarted?.();
      const story = await this.generatePartial<PartialStoryA>({ kind: "A", question, brief, model, systemPrompt: PARTIAL_STORY_A_SYSTEM_PROMPT, jsonSchema: partialStoryAJsonSchema, schema: partialStoryASchema });
      await onStoryACompleted?.(story);
      return story;
    };
    const generateB = async () => {
      await onStoryBStarted?.();
      const story = await this.generatePartial<PartialStoryB>({ kind: "B", question, brief, model, systemPrompt: PARTIAL_STORY_B_SYSTEM_PROMPT, jsonSchema: partialStoryBJsonSchema, schema: partialStoryBSchema });
      await onStoryBCompleted?.(story);
      return story;
    };
    let storyA: PartialStoryA;
    let storyB: PartialStoryB;
    if (concurrency === 1) {
      storyA = await generateA();
      storyB = await generateB();
    } else {
      const [storyAResult, storyBResult] = await Promise.allSettled([generateA(), generateB()]);
      if (storyAResult.status === "rejected") throw storyAResult.reason;
      if (storyBResult.status === "rejected") throw storyBResult.reason;
      storyA = storyAResult.value;
      storyB = storyBResult.value;
    }
    log("timing", `story-composer wall: ${Math.round(performance.now() - wallStartedAt)}ms`);
    const mergeStartedAt = performance.now();
    const story = mergeAnalysisStory(storyA, storyB);
    log("timing", `story merge: ${Math.round(performance.now() - mergeStartedAt)}ms`);
    log("story-composer", "validation success");
    log("provider", `429_count: ${this.transient429Count}`);
    return story;
  }
}
