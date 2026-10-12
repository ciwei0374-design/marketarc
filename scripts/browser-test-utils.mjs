import nextEnv from "@next/env";
import { chromium } from "playwright";
import { createHmac, randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

nextEnv.loadEnvConfig(process.cwd());

export function launchBrowser() {
  return chromium.launch({ headless: true,
    ...(process.env.MARKETARC_BROWSER_PATH ? { executablePath: process.env.MARKETARC_BROWSER_PATH }
      : process.env.MARKETARC_BROWSER_CHANNEL ? { channel: process.env.MARKETARC_BROWSER_CHANNEL } : {}),
  });
}

export async function authorizeContext(context, baseUrl) {
  const code = process.env.DEMO_ACCESS_CODE?.trim();
  if (!code) return;
  const token = createHmac("sha256", code).update("marketarc-demo-access-v1").digest("base64url");
  await context.addCookies([{ name: "marketarc_demo_access", value: token, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
}

// Only bundled Golden Stories are submitted: this helper never requests live AI.
// The tested server must run from the same checkout as this script.
export async function createBrowserFixtures(browser, baseUrl) {
  const server = new URL(baseUrl);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(server.hostname) || server.port === "3001") {
    throw new Error("Fixture tests require an isolated loopback server, never the public port 3001");
  }
  const jobsDirectory = path.join(process.cwd(), "data", "jobs");
  const ownedPaths = [];
  const cleanup = async () => { await Promise.all(ownedPaths.map((file) => rm(file, { force: true }))); };
  const context = await browser.newContext();
  try {
    await authorizeContext(context, baseUrl);
    const response = await context.request.post(`${baseUrl}/api/analyze`, { data: { question: "美联储为什么降息？" } });
    const submission = await response.json();
    if (!response.ok() || submission.status !== "complete" || !/^[a-f0-9-]{36}$/.test(submission.jobId ?? "")) throw new Error("Bundled Golden Story submission failed; check server URL/access configuration");
    const sourcePath = path.join(jobsDirectory, `${submission.jobId}.json`);
    ownedPaths.push(sourcePath);
    const status = await context.request.get(`${baseUrl}/api/analyze/status?id=${submission.jobId}`);
    const source = await status.json();
    if (!status.ok() || !source.analysisStory || source.status !== "complete") throw new Error("Golden job not persisted");
    const story = source.analysisStory;
    const partialStoryA = Object.fromEntries(["slug", "topic", "category", "eyebrow", "title", "subtitle", "disclaimer", "hook", "analogy", "background", "keyInsight", "evidence"].map((key) => [key, story[key]]));
    const researchBrief = {
      question: source.question, thesis: story.hook,
      whatHappened: ["离线测试数据：政策利率影响融资成本。", "本夹具不代表当前行情。"],
      causalChain: ["政策变化", "融资成本", "资产估值"], keyDrivers: ["利率"],
      expectationGap: { marketExpected: "示例预期", actualOrCurrent: "示例结果", whyItMatters: "比较预期而不是只看方向" },
      counterArguments: ["盈利变化可能抵消利率影响"], assetImpacts: [{ asset: "股票", mechanism: "贴现率变化" }],
      watchlist: [{ indicator: "利率", why: "观察资金成本" }], sourcesUsed: [], confidence: "low",
    };
    const base = { ...source, researchBrief, partialStoryA, analysisStory: null, error: null };
    const longStory = structuredClone(story);
    const longText = "这是离线排版压力测试，不代表真实行情。融资成本变化会影响未来现金流的现值，但盈利预期和风险偏好也可能抵消这种影响。";
    longStory.keyInsight.body.lines = [longText.repeat(4), longText.repeat(2)];
    longStory.expectationGap.englishStatement = ["This is a deterministic layout stress test, not a current market forecast. ".repeat(4)];
    longStory.expectationGap.statement.lines = [longText.repeat(2)];
    longStory.expectationGap.insight.lines = [longText.repeat(2)];
    longStory.expectationGap.cases[0].expected = longText;
    const definitions = {
      quick: { ...base, status: "analyzing", partialStoryA: null, progress: { current: "analyzing", completed: ["research", "researchBrief"] } },
      partial: { ...base, status: "story_b", progress: { current: "story_b", completed: ["research", "researchBrief", "storyA"] } },
      failed: { ...base, status: "failed", researchBrief: null, partialStoryA: null, progress: { current: "failed", completed: [] }, error: "离线测试：服务暂时未能完成，请重试。" },
      failedPartial: { ...base, status: "failed", progress: { current: "failed", completed: ["storyA"] }, error: "离线测试：Story B 未完成。" },
      long: { ...source, analysisStory: longStory },
    };
    await mkdir(jobsDirectory, { recursive: true });
    const ids = { complete: source.id };
    for (const [name, definition] of Object.entries(definitions)) {
      const id = randomUUID();
      const file = path.join(jobsDirectory, `${id}.json`);
      await writeFile(file, JSON.stringify({ ...definition, id }), { encoding: "utf8", flag: "wx" });
      ownedPaths.push(file);
      ids[name] = id;
    }
    return { ids, ownedPaths, cleanup };
  } catch (error) {
    await cleanup();
    throw error;
  } finally {
    await context.close();
  }
}
