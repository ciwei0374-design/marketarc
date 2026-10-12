import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AnalysisJob } from "@/types/analysis-job";

const jobsDirectory = path.join(process.cwd(), "data", "jobs");
const jobIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jobPath(id: string) {
  if (!jobIdPattern.test(id)) throw new Error("Invalid analysis job id");
  return path.join(jobsDirectory, `${id}.json`);
}

async function writeJob(job: AnalysisJob) {
  await mkdir(jobsDirectory, { recursive: true });
  const target = jobPath(job.id);
  const temporary = `${target}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary, JSON.stringify(job, null, 2), "utf8");
  await rename(temporary, target);
}

export async function createAnalysisJob(question: string, completedStory?: AnalysisJob["analysisStory"]) {
  const now = new Date().toISOString();
  const complete = Boolean(completedStory);
  const job: AnalysisJob = {
    id: randomUUID(),
    question,
    status: complete ? "complete" : "queued",
    createdAt: now,
    updatedAt: now,
    progress: { current: complete ? "complete" : "queued", completed: complete ? ["research", "researchBrief", "storyA", "storyB"] : [] },
    researchSummary: null,
    researchContextRef: null,
    researchBrief: null,
    partialStoryA: null,
    partialStoryB: null,
    analysisStory: completedStory ?? null,
    error: null,
  };
  await writeJob(job);
  return job;
}

export async function getAnalysisJob(id: string): Promise<AnalysisJob | undefined> {
  try {
    const parsed = JSON.parse(await readFile(jobPath(id), "utf8")) as AnalysisJob;
    if (parsed.id !== id || typeof parsed.question !== "string" || typeof parsed.status !== "string") return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export async function updateAnalysisJob(id: string, update: Partial<Omit<AnalysisJob, "id" | "createdAt">>) {
  const current = await getAnalysisJob(id);
  if (!current) throw new Error("Analysis job not found");
  const next: AnalysisJob = {
    ...current,
    ...update,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
  await writeJob(next);
  return next;
}
