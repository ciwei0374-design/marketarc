import nextEnv from "@next/env";
import { createHmac } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

nextEnv.loadEnvConfig(process.cwd());
const require = createRequire("C:/Users/34352/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json");
const { chromium } = require("playwright");
const baseUrl = process.env.MARKETARC_UX_BASE_URL || "http://localhost:3102";
const outputDirectory = process.env.MARKETARC_UX_OUTPUT_DIR || path.join(process.cwd(), "data", "evals", "story-ux");
const scenarios = [
  { id: "hkd-long", path: "/analysis/job/f5626763-78d7-430f-8c03-c67da9391f3e" },
  { id: "treasury", path: "/analysis/job/6b2fe128-2562-4edd-ab56-ae9c9005b030" },
  { id: "golden", path: `/analysis?q=${encodeURIComponent("美联储为什么降息？")}` },
  { id: "hkd-failed-partial", path: "/analysis/job/797311f3-abdb-4df8-9fe2-05ef4992af89" },
];
const viewports = [
  { width: 320, height: 740 },
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.MARKETARC_BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
const results = [];
try {
  for (const scenario of scenarios) {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const code = process.env.DEMO_ACCESS_CODE?.trim();
      if (code) {
        const token = createHmac("sha256", code).update("marketarc-demo-access-v1").digest("base64url");
        await context.addCookies([{ name: "marketarc_demo_access", value: token, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
      }
      const page = await context.newPage();
      await page.goto(`${baseUrl}${scenario.path}`, { waitUntil: "networkidle" });
      const metrics = await page.evaluate(() => {
        const selectors = [".insight-section h2", ".insight-body p", ".expectation-english", ".expectation-statement", ".expectation-quote", ".scenario-card dd", ".surprise strong", ".story-partial-status-title"];
        const textBlocks = Object.fromEntries(selectors.map((selector) => {
          const elements = [...document.querySelectorAll(selector)];
          return [selector, elements.map((element) => ({ fontSize: Number.parseFloat(getComputedStyle(element).fontSize), width: element.clientWidth, scrollWidth: element.scrollWidth, height: element.clientHeight, scrollHeight: element.scrollHeight, textLength: element.textContent?.length ?? 0 }))];
        }));
        return { heading: document.querySelector(".story-hero h1")?.textContent ?? "", clientWidth: document.documentElement.clientWidth, scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), partialFailureVisible: document.body.textContent?.includes("分析未完成，以上为已生成的部分内容") ?? false, retryVisible: [...document.querySelectorAll("button")].some((button) => button.textContent?.includes("重新尝试")), textBlocks };
      });
      if (scenario.id === "hkd-long" && (viewport.width === 390 || viewport.width === 1440)) {
        await page.locator(".insight-section").screenshot({ path: path.join(outputDirectory, `${scenario.id}-${viewport.width}-insight.png`) });
        await page.locator(".expectation-section").screenshot({ path: path.join(outputDirectory, `${scenario.id}-${viewport.width}-expectation.png`) });
      }
      if (scenario.id === "hkd-failed-partial" && viewport.width === 390) {
        await page.locator(".story-section").last().screenshot({ path: path.join(outputDirectory, "hkd-failed-partial-390.png") });
      }
      results.push({ scenario: scenario.id, viewport: viewport.width, ...metrics });
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const failures = results.filter((result) => result.scrollWidth > result.clientWidth || (result.scenario === "hkd-failed-partial" && (!result.partialFailureVisible || !result.retryVisible)) || Object.values(result.textBlocks).flat().some((block) => block.scrollWidth > block.width + 1 || block.scrollHeight > block.height + 1) || (result.viewport <= 390 ? (
  result.textBlocks[".insight-body p"].some((block) => block.fontSize > 20) ||
  result.textBlocks[".expectation-english"].some((block) => block.fontSize > 18) ||
  result.textBlocks[".expectation-statement"].some((block) => block.fontSize > 30) ||
  result.textBlocks[".expectation-quote"].some((block) => block.fontSize > 24) ||
  result.textBlocks[".scenario-card dd"].some((block) => block.fontSize > 21) ||
  result.textBlocks[".story-partial-status-title"].some((block) => block.fontSize > 26)
) : (
  result.textBlocks[".expectation-statement"].some((block) => block.fontSize > 64) ||
  result.textBlocks[".expectation-quote"].some((block) => block.fontSize > 56) ||
  result.textBlocks[".scenario-card dd"].some((block) => block.fontSize > 25)
)));
await writeFile(path.join(outputDirectory, "metrics.json"), JSON.stringify({ results, failures }, null, 2));
console.log(JSON.stringify({ status: failures.length ? "FAIL" : "PASS", scenarios: scenarios.length, viewports: viewports.length, failures, mobile: results.filter((result) => result.viewport === 390).map((result) => ({ scenario: result.scenario, insightBodySize: result.textBlocks[".insight-body p"][0]?.fontSize, englishSize: result.textBlocks[".expectation-english"][0]?.fontSize, statementSize: result.textBlocks[".expectation-statement"][0]?.fontSize })) }));
if (failures.length) process.exitCode = 1;
