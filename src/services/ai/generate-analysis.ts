import "server-only";
import type { AnalysisStory } from "@/types/analysis";
import { getAIProvider, getAIStageModels } from "./provider";
import { parseAnalysisStory, toAnalysisStorySchemaValue } from "./analysis-schema";
import { getResearchProvider, toResearchPromptContext, type ResearchContext } from "@/services/research";
import { getCachedResearch, setCachedResearch } from "@/services/research/cache";
import { getResearchCacheReference } from "@/services/research/cache";
import { getCachedResearchBrief, setCachedResearchBrief } from "./research-brief-cache";
import type { ResearchBrief } from "@/types/research-brief";
import type { PartialStoryA, PartialStoryB } from "./partial-story-schema";

export type AnalysisPipelineHooks = {
  onResearch?: (research: ResearchContext, reference: string | null) => Promise<void>;
  onResearchBrief?: (brief: ResearchBrief) => Promise<void>;
  onStoryAStarted?: () => Promise<void>;
  onStoryACompleted?: (story: PartialStoryA) => Promise<void>;
  onStoryBStarted?: () => Promise<void>;
  onStoryBCompleted?: (story: PartialStoryB) => Promise<void>;
};

function applyResearchDisclosure(story: AnalysisStory, research: ResearchContext, sourceIds: string[]): AnalysisStory {
  if (!research.searched) {
    const unavailable = research.status === "unavailable";
    return {
      ...story,
      disclaimer: `${unavailable ? "实时研究暂不可用" : "本次分析未使用实时联网研究。"} · 不构成投资建议`,
      sources: [{ name: unavailable ? "实时研究暂不可用" : "未进行实时网络研究", description: "本次分析基于模型已有知识与通用研究框架，不包含实时信息核验。" }],
      sourceLabel: unavailable ? "实时研究暂不可用" : "未进行实时网络研究",
      methodology: `${unavailable ? "实时研究暂不可用。" : "本次分析未使用实时联网研究。"}内容不应被视为最新市场信息。`,
    };
  }
  const selectedSources = research.sources.filter((source) => sourceIds.includes(source.id));
  const disclosedSources = selectedSources.length > 0 ? selectedSources : research.sources;
  return {
    ...story,
    sources: disclosedSources.map((source) => ({
      name: source.publisher,
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      date: source.publishedAt ?? "",
      description: source.snippet,
    })),
    disclaimer: `已联网检索 · ${disclosedSources.length} 个采用来源${research.sources.some((source) => source.isPrimary) ? "" : " · 缺少一手来源，当前行情未核实"} · 不构成投资建议`,
    sourceLabel: `已联网检索 · ${disclosedSources.length} 个采用来源 · 检索时间：${research.searchedAt}`,
    methodology: `来源由 ${research.provider} 实时检索。Verified 仅表示来源真实检索到，不代表事实绝对正确；分析与事实应分别判断。`,
  };
}

export async function generateAnalysis(question: string, hooks: AnalysisPipelineHooks = {}): Promise<AnalysisStory> {
  const totalStartedAt = performance.now();
  const researchStartedAt = performance.now();
  const researchProvider = getResearchProvider();
  const cachedResearch = await getCachedResearch(question, researchProvider.id);
  const researchContext = cachedResearch ?? await researchProvider.research(question);
  if (!cachedResearch) await setCachedResearch(question, researchContext);
  await hooks.onResearch?.(researchContext, researchContext.searched ? getResearchCacheReference(question, researchProvider.id) : null);
  if (process.env.NODE_ENV === "development") console.log("[research] context source", { source: cachedResearch ? "cache" : "provider" });
  if (process.env.NODE_ENV === "development") console.log(`[research] sources: ${researchContext.sources.length}`);
  if (process.env.NODE_ENV === "development") console.log(`[timing] research: ${Math.round(performance.now() - researchStartedAt)}ms`);

  const provider = getAIProvider();
  const { researchModel, storyModel } = getAIStageModels();
  const stage1StartedAt = performance.now();
  const cachedBrief = await getCachedResearchBrief(question, researchContext, researchModel);
  const generatedBrief = cachedBrief ?? await provider.generateResearchBrief({ question, research: toResearchPromptContext(researchContext), model: researchModel });
  const validSourceIds = new Set(researchContext.sources.map((source) => source.id));
  const selectedSourceIds = generatedBrief.sourcesUsed.filter((sourceId) => validSourceIds.has(sourceId));
  const brief = {
    ...generatedBrief,
    question,
    sourcesUsed: selectedSourceIds.length > 0 || !researchContext.searched
      ? selectedSourceIds
      : researchContext.sources.slice(0, 3).map((source) => source.id),
  };
  if (!cachedBrief) await setCachedResearchBrief(question, researchContext, researchModel, brief);
  await hooks.onResearchBrief?.(brief);
  if (process.env.NODE_ENV === "development") {
    console.log(`[research-brief] chars: ${JSON.stringify(brief).length}`);
    console.log("[research-brief] source", { source: cachedBrief ? "cache" : "provider" });
    console.log(`[timing] stage1: ${Math.round(performance.now() - stage1StartedAt)}ms`);
  }

  const stage2StartedAt = performance.now();
  const story = await provider.composeAnalysis({
    question,
    brief,
    model: storyModel,
    onStoryAStarted: hooks.onStoryAStarted,
    onStoryACompleted: hooks.onStoryACompleted,
    onStoryBStarted: hooks.onStoryBStarted,
    onStoryBCompleted: hooks.onStoryBCompleted,
  });
  if (process.env.NODE_ENV === "development") console.log(`[timing] stage2: ${Math.round(performance.now() - stage2StartedAt)}ms`);
  const validationStartedAt = performance.now();
  const finalized = applyResearchDisclosure({ ...story, topic: question }, researchContext, brief.sourcesUsed);
  const validated = parseAnalysisStory(toAnalysisStorySchemaValue(finalized));
  if (process.env.NODE_ENV === "development") {
    console.log(`[timing] validation: ${Math.round(performance.now() - validationStartedAt)}ms`);
    console.log(`[timing] total: ${Math.round(performance.now() - totalStartedAt)}ms`);
  }
  return validated;
}
