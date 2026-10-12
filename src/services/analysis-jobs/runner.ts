import "server-only";
import { generateAnalysis } from "@/services/ai/generate-analysis";
import { setCachedAnalysis } from "@/services/analysis-cache";
import { getAnalysisJob, updateAnalysisJob } from "./store";

const activeJobs = new Map<string, Promise<void>>();

function failureMessage(error: unknown) {
  const status = error && typeof error === "object" && "status" in error ? error.status : undefined;
  if (status === 429) return "研究服务目前繁忙，未能完成这次分析。请稍后重试。";
  if ([502, 503, 504].includes(Number(status))) return "研究服务暂时不稳定，未能完成后续分析。已生成的内容仍可阅读，稍后可以重试。";
  const name = error instanceof Error ? error.name : "";
  if (name === "SyntaxError" || name === "ZodError") return "模型返回的内容格式不完整，未能生成可信的完整结果。请稍后重试。";
  if (/timeout/i.test(name)) return "研究服务响应超时，未能完成这次分析。请稍后重试。";
  return "这次研究没有成功完成，请稍后重试。";
}

async function runAnalysisJob(id: string) {
  const job = await getAnalysisJob(id);
  if (!job || job.status === "complete") return;
  const completed: Array<"research" | "researchBrief" | "storyA" | "storyB"> = [];

  try {
    await updateAnalysisJob(id, { status: "researching", progress: { current: "researching", completed } });
    const story = await generateAnalysis(job.question, {
      onResearch: async (research, reference) => {
        completed.push("research");
        await updateAnalysisJob(id, {
          status: "analyzing",
          progress: { current: "analyzing", completed: [...completed] },
          researchContextRef: reference,
          researchSummary: {
            sources: research.sources.length,
            primary: research.sources.filter((source) => source.isPrimary).length,
            official: research.sources.filter((source) => source.sourceType === "official").length,
            primaryCoverage: research.primarySourceCoverage,
          },
        });
      },
      onResearchBrief: async (brief) => {
        completed.push("researchBrief");
        await updateAnalysisJob(id, { researchBrief: brief, progress: { current: "analyzing", completed: [...completed] } });
      },
      onStoryAStarted: async () => {
        await updateAnalysisJob(id, { status: "story_a", progress: { current: "story_a", completed: [...completed] } });
      },
      onStoryACompleted: async (partialStoryA) => {
        completed.push("storyA");
        await updateAnalysisJob(id, { partialStoryA, status: "story_b", progress: { current: "story_b", completed: [...completed] } });
      },
      onStoryBStarted: async () => {
        await updateAnalysisJob(id, { status: "story_b", progress: { current: "story_b", completed: [...completed] } });
      },
      onStoryBCompleted: async (partialStoryB) => {
        completed.push("storyB");
        await updateAnalysisJob(id, { partialStoryB, progress: { current: "story_b", completed: [...completed] } });
      },
    });

    await setCachedAnalysis(job.question, story);
    await updateAnalysisJob(id, {
      status: "complete",
      progress: { current: "complete", completed: ["research", "researchBrief", "storyA", "storyB"] },
      analysisStory: story,
      error: null,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("Analysis job failed", { id, type: error instanceof Error ? error.name : typeof error, message: error instanceof Error ? error.message : String(error) });
    else console.error("Analysis job failed", { id, type: error instanceof Error ? error.name : typeof error, status: error && typeof error === "object" && "status" in error ? error.status : undefined });
    await updateAnalysisJob(id, {
      status: "failed",
      progress: { current: "failed", completed: [...completed] },
      error: failureMessage(error),
    });
  }
}

export function startAnalysisJob(id: string) {
  if (activeJobs.has(id)) return;
  const running = runAnalysisJob(id).finally(() => activeJobs.delete(id));
  activeJobs.set(id, running);
}
