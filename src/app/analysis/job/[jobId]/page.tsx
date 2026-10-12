import { notFound } from "next/navigation";
import { getAnalysisJob } from "@/services/analysis-jobs/store";
import { AnalysisJobView } from "@/components/analysis-job-view";

export const dynamic = "force-dynamic";

export default async function AnalysisJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const job = await getAnalysisJob(jobId);
  if (!job) notFound();
  return <AnalysisJobView initialJob={job} />;
}
