import nextEnv from "@next/env";
import { createHmac } from "node:crypto";

nextEnv.loadEnvConfig(process.cwd());
const questions = {
  hkd: "港币贬值",
  treasury: "为什么美债收益率上升时，成长型科技股的估值往往更敏感？",
};
const scenario = process.argv[2];
if (!(scenario in questions)) throw new Error("Choose hkd or treasury");

const baseUrl = process.env.MARKETARC_LIVE_BASE_URL || "http://localhost:3102";
const code = process.env.DEMO_ACCESS_CODE?.trim();
const cookie = code ? `marketarc_demo_access=${createHmac("sha256", code).update("marketarc-demo-access-v1").digest("base64url")}` : "";
const headers = { ...(cookie ? { Cookie: cookie } : {}) };
const created = await fetch(`${baseUrl}/api/analyze`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ question: questions[scenario] }),
});
const payload = await created.json();
if (!created.ok || typeof payload.jobId !== "string") throw new Error(`Could not create ${scenario} job: HTTP ${created.status}`);
const started = Date.now();
let previousStatus = "";
console.log(JSON.stringify({ scenario, jobId: payload.jobId, createStatus: created.status }));
for (;;) {
  if (Date.now() - started > 7 * 60_000) throw new Error(`${scenario} exceeded 7-minute observation window; job may still be running`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const response = await fetch(`${baseUrl}/api/analyze/status?id=${encodeURIComponent(payload.jobId)}`, { headers, cache: "no-store" });
  if (!response.ok) throw new Error(`${scenario} status HTTP ${response.status}`);
  const job = await response.json();
  if (job.status !== previousStatus) {
    console.log(JSON.stringify({ scenario, status: job.status, elapsedSeconds: Math.round((Date.now() - started) / 1000), sources: job.researchSummary?.sources ?? null, primary: job.researchSummary?.primary ?? null, confidence: job.researchBrief?.confidence ?? null }));
    previousStatus = job.status;
  }
  if (job.status === "complete" || job.status === "failed") {
    console.log(JSON.stringify({ scenario, result: job.status, elapsedSeconds: Math.round((Date.now() - started) / 1000), jobId: payload.jobId, sources: job.researchSummary?.sources ?? null, primary: job.researchSummary?.primary ?? null, sourceTitles: job.analysisStory?.sources?.map((source) => source.title) ?? [], insightCharacters: job.analysisStory?.keyInsight?.body?.lines?.join("")?.length ?? null }));
    if (job.status === "failed") process.exitCode = 1;
    break;
  }
}
