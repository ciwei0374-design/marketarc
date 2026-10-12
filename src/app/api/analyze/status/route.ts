import { NextResponse } from "next/server";
import { getAnalysisJob } from "@/services/analysis-jobs/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  const job = await getAnalysisJob(id);
  if (!job) return NextResponse.json({ message: "研究任务不存在或已失效。" }, { status: 404 });
  return NextResponse.json(job, { headers: { "Cache-Control": "no-store" } });
}
