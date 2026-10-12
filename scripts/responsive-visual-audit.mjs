import nextEnv from "@next/env";
import { createHmac } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const bundledNodeModules = "C:/Users/34352/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const require = createRequire(`${bundledNodeModules}/package.json`);
const { chromium } = require("playwright");

const baseUrl = process.env.MARKETARC_VISUAL_BASE_URL || "http://localhost:3102";
const outputDirectory = process.env.MARKETARC_VISUAL_OUTPUT_DIR || path.join(process.cwd(), "data", "evals", "responsive");
const label = process.env.MARKETARC_VISUAL_LABEL || "current";
const allPages = [
  { id: "home", path: "/" },
  { id: "progress", path: "/analysis/job/33333333-3333-4333-8333-333333333333" },
  { id: "analysis", path: `/analysis?q=${encodeURIComponent("美联储为什么降息？")}` },
  { id: "today", path: "/today" },
  { id: "map", path: "/map" },
];
const visualScope = process.env.MARKETARC_VISUAL_SCOPE;
const pages = visualScope ? allPages.filter((page) => page.id === visualScope) : allPages;
const viewports = [
  { id: "desktop", width: 1440, height: 1000 },
  { id: "mobile", width: 390, height: 844 },
];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.MARKETARC_BROWSER_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
});
const results = [];
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const code = process.env.DEMO_ACCESS_CODE?.trim();
    if (code) {
      const token = createHmac("sha256", code).update("marketarc-demo-access-v1").digest("base64url");
      await context.addCookies([{ name: "marketarc_demo_access", value: token, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
    }
    const page = await context.newPage();
    for (const target of pages) {
      const failedAssets = [];
      const recordFailedResponse = (response) => {
        if (response.status() >= 400 && /\.(css|js)(\?|$)/.test(response.url())) failedAssets.push({ url: response.url(), status: response.status() });
      };
      page.on("response", recordFailedResponse);
      await page.goto(`${baseUrl}${target.path}`, { waitUntil: "networkidle" });
      const metrics = await page.evaluate(() => {
        const expectation = document.querySelector(".expectation-statement");
        const finale = document.querySelector(".finale-flow");
        const market = document.querySelector(".today-market");
        const marketHeading = document.querySelector(".today-hero h1");
        const deepLink = document.querySelector(".today-deep-link");
        const investmentMap = document.querySelector(".investment-map");
        const mapHeading = document.querySelector(".map-hero h1");
        const selectedMapTab = document.querySelector('.map-tabs button[aria-selected="true"]');
        return {
          path: window.location.pathname + window.location.search,
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          expectationFontSize: expectation ? getComputedStyle(expectation).fontSize : null,
          expectationLineHeight: expectation ? getComputedStyle(expectation).lineHeight : null,
          finaleDisplay: finale ? getComputedStyle(finale).display : null,
          finaleColumns: finale ? getComputedStyle(finale).gridTemplateColumns : null,
          styleSheetCount: document.styleSheets.length,
          bodyBackground: getComputedStyle(document.body).backgroundColor,
          marketBackground: market ? getComputedStyle(market).backgroundColor : null,
          marketHeadingColor: marketHeading ? getComputedStyle(marketHeading).color : null,
          marketHeadingFontSize: marketHeading ? getComputedStyle(marketHeading).fontSize : null,
          deepLinkColor: deepLink ? getComputedStyle(deepLink).color : null,
          deepLinkDecoration: deepLink ? getComputedStyle(deepLink).textDecorationLine : null,
          mapBackground: investmentMap ? getComputedStyle(investmentMap).backgroundColor : null,
          mapHeadingColor: mapHeading ? getComputedStyle(mapHeading).color : null,
          mapHeadingFontSize: mapHeading ? getComputedStyle(mapHeading).fontSize : null,
          selectedMapTabBackground: selectedMapTab ? getComputedStyle(selectedMapTab).backgroundColor : null,
        };
      });
      const screenshot = path.join(outputDirectory, `${label}-${target.id}-${viewport.id}.png`);
      await page.screenshot({ path: screenshot, fullPage: true });
      let interaction;
      if (target.id === "home") {
        await page.getByRole("button", { name: "美联储为什么降息？" }).click();
        interaction = { exampleSelection: await page.locator("#question").inputValue() };
      } else if (target.id === "progress") {
        interaction = { progressRows: await page.locator("section .grid.gap-3 > div").count() };
      } else if (target.id === "analysis") {
        interaction = {
          storyActions: await page.locator(".story-actions a").count(),
          clickableSources: await page.locator(".source-list a").count(),
        };
      } else if (target.id === "today") {
        interaction = {
          marketItems: await page.locator(".today-item").count(),
          deepLinks: await page.locator(".today-deep-link").count(),
          boundaryModules: await page.locator(".today-boundary").count(),
        };
      } else {
        const tabs = page.getByRole("tab");
        const visited = [];
        for (let index = 0; index < await tabs.count(); index += 1) {
          await tabs.nth(index).click();
          visited.push({ tab: await tabs.nth(index).innerText(), selected: await tabs.nth(index).getAttribute("aria-selected"), heading: await page.locator(".map-path h2").innerText() });
        }
        interaction = {
          tabs: await tabs.count(),
          assetCards: await page.locator(".map-assets > div").count(),
          counterconditions: await page.locator(".map-conditions article").count(),
          watchCards: await page.locator(".map-watch article").count(),
          visited,
        };
      }
      page.off("response", recordFailedResponse);
      results.push({ page: target.id, viewport, screenshot, interaction, failedAssets, ...metrics, horizontalOverflow: Math.max(metrics.scrollWidth, metrics.bodyScrollWidth) > metrics.clientWidth });
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const resultPath = path.join(outputDirectory, `${label}-metrics.json`);
await writeFile(resultPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ resultPath, results }));
if (results.some((result) => result.horizontalOverflow)) process.exitCode = 1;
if (results.some((result) => result.page === "home" && result.interaction.exampleSelection !== "美联储为什么降息？")) process.exitCode = 1;
if (results.some((result) => result.page === "progress" && result.interaction.progressRows !== 6)) process.exitCode = 1;
if (results.some((result) => result.page === "today" && (result.interaction.marketItems !== 3 || result.interaction.deepLinks !== 3 || result.interaction.boundaryModules !== 9))) process.exitCode = 1;
if (results.some((result) => result.page === "today" && (result.failedAssets.length > 0 || result.styleSheetCount < 1 || result.marketBackground !== "rgb(9, 10, 12)" || result.marketHeadingColor !== "rgb(244, 244, 245)" || result.deepLinkDecoration !== "none"))) process.exitCode = 1;
if (results.some((result) => result.page === "map" && (result.failedAssets.length > 0 || result.styleSheetCount < 1 || result.mapBackground !== "rgb(9, 10, 12)" || result.mapHeadingColor !== "rgb(244, 244, 245)" || result.interaction.tabs !== 3 || result.interaction.visited.some((visit) => visit.selected !== "true")))) process.exitCode = 1;
