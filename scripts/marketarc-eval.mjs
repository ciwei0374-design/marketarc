import nextEnv from "@next/env";
import { createHmac, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const DEFAULT_QUESTIONS = [
  "比特币为什么下跌？",
  "为什么美债收益率上涨会影响科技股？",
  "为什么英伟达业绩很好，股价还是可能下跌？",
];
const requestedQuestions = process.argv.slice(2).filter(Boolean);
const questions = requestedQuestions.length > 0 ? requestedQuestions : DEFAULT_QUESTIONS;
const baseUrl = process.env.MARKETARC_EVAL_BASE_URL?.trim() || "http://localhost:3101";
const maxRequests = Math.min(5, Math.max(1, Number.parseInt(process.env.MARKETARC_EVAL_MAX_REQUESTS || "3", 10) || 3));
const pollIntervalMs = 1_800;
const jobTimeoutMs = 6 * 60_000;

if (questions.length > maxRequests) {
  throw new Error(`Eval request limit exceeded: ${questions.length}/${maxRequests}`);
}

function accessCookie() {
  const code = process.env.DEMO_ACCESS_CODE?.trim();
  if (!code) return undefined;
  const token = createHmac("sha256", code).update("marketarc-demo-access-v1").digest("base64url");
  return `marketarc_demo_access=${token}`;
}

const cookie = accessCookie();
const headers = (json = false) => ({
  ...(json ? { "content-type": "application/json" } : {}),
  ...(cookie ? { cookie } : {}),
});

async function runQuestion(question) {
  const startedAt = Date.now();
  const response = await fetch(`${baseUrl}/api/analyze`, {
    method: "POST",
    headers: headers(true),
    body: JSON.stringify({ question }),
  });
  const responseMs = Date.now() - startedAt;
  const created = await response.json();
  if (!response.ok || typeof created.jobId !== "string") {
    return { question, pass: false, postHttp: response.status, postResponseMs: responseMs, failure: "job_creation_failed" };
  }

  const milestones = {};
  let latest;
  while (Date.now() - startedAt < jobTimeoutMs) {
    const statusResponse = await fetch(`${baseUrl}/api/analyze/status?id=${encodeURIComponent(created.jobId)}`, {
      headers: headers(),
      cache: "no-store",
    });
    latest = await statusResponse.json();
    const elapsed = Date.now() - startedAt;
    if (latest.researchSummary && milestones.researchMs === undefined) milestones.researchMs = elapsed;
    if (latest.researchBrief && milestones.researchBriefMs === undefined) milestones.researchBriefMs = elapsed;
    if (latest.partialStoryA && milestones.storyAMs === undefined) milestones.storyAMs = elapsed;
    if (latest.partialStoryB && milestones.storyBMs === undefined) milestones.storyBMs = elapsed;
    if (latest.status === "complete" || latest.status === "failed") {
      return {
        question,
        jobId: created.jobId,
        pass: latest.status === "complete",
        postHttp: response.status,
        statusHttp: statusResponse.status,
        postResponseMs: responseMs,
        ...milestones,
        completeMs: latest.status === "complete" ? elapsed : undefined,
        finalStatus: latest.status,
        research: latest.researchSummary ?? null,
        hasResearchBrief: Boolean(latest.researchBrief),
        hasStoryA: Boolean(latest.partialStoryA),
        hasStoryB: Boolean(latest.partialStoryB),
        hasAnalysisStory: Boolean(latest.analysisStory),
        validation: latest.analysisStory ? "success" : "not_completed",
        cacheWrite: latest.analysisStory ? "success" : "not_completed",
        safeError: latest.error ?? null,
      };
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
  return { question, jobId: created.jobId, pass: false, postHttp: response.status, postResponseMs: responseMs, failure: "job_timeout" };
}

const runStartedAt = new Date().toISOString();
const results = [];
for (const question of questions) {
  const result = await runQuestion(question);
  results.push(result);
  console.log("[marketarc-eval]", JSON.stringify({
    question: result.question,
    jobId: result.jobId,
    pass: result.pass,
    totalMs: result.completeMs,
    finalStatus: result.finalStatus,
  }));
}

const artifact = {
  runId: randomUUID(),
  runStartedAt,
  runCompletedAt: new Date().toISOString(),
  baseUrl,
  requestLimit: maxRequests,
  totalRequests: results.length,
  passCount: results.filter((result) => result.pass).length,
  results,
};
const outputDirectory = path.join(process.cwd(), "data", "evals", runStartedAt.slice(0, 10));
await mkdir(outputDirectory, { recursive: true });
const outputPath = path.join(outputDirectory, `bootstrap-${runStartedAt.replaceAll(":", "-")}.json`);
await writeFile(outputPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
console.log("[marketarc-eval]", JSON.stringify({ outputPath: path.relative(process.cwd(), outputPath), passCount: artifact.passCount, total: results.length }));
if (artifact.passCount !== results.length) process.exitCode = 1;
