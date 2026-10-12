import { NextResponse } from "next/server";
import { getAnalysisStory } from "../../../../data/analysis";
import { getCachedAnalysis } from "@/services/analysis-cache";
import { createAnalysisJob } from "@/services/analysis-jobs/store";
import { startAnalysisJob } from "@/services/analysis-jobs/runner";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestStartedAt = performance.now();
  try {
    const body = (await request.json()) as { question?: unknown };
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!question) return NextResponse.json({ message: "请输入一个你想看懂的财经问题。" }, { status: 400 });
    if (question.length > 300) return NextResponse.json({ message: "问题太长了，请精简后再试。" }, { status: 400 });

    const completedStory = getAnalysisStory(question) ?? await getCachedAnalysis(question);
    const job = await createAnalysisJob(question, completedStory);
    if (!completedStory) startAnalysisJob(job.id);

    if (process.env.NODE_ENV === "development") {
      console.log("[analysis-job] created", { id: job.id, status: job.status, source: completedStory ? "cache" : "pipeline" });
      console.log(`[timing] job create response: ${Math.round(performance.now() - requestStartedAt)}ms`);
    }
    return NextResponse.json({ jobId: job.id, status: job.status }, { status: completedStory ? 200 : 202 });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("Analysis job creation failed", error);
    return NextResponse.json({ code: "JOB_CREATION_FAILED", message: "暂时无法创建研究任务，请稍后重试。" }, { status: 500 });
  }
}
