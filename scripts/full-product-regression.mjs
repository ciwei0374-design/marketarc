import nextEnv from "@next/env";
import { createHmac } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { launchBrowser, createBrowserFixtures } from "./browser-test-utils.mjs";
import path from "node:path";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const baseUrl = process.env.MARKETARC_FULL_BASE_URL || "http://localhost:3102";
const outputDirectory = process.env.MARKETARC_FULL_OUTPUT_DIR || path.join(process.cwd(), "data", "evals", "delivery-v1");
const jobsDirectory = path.join(process.cwd(), "data", "jobs");
await mkdir(outputDirectory, { recursive: true });
const browser = await launchBrowser();
let fixtures;
const results = { access: {}, api: {}, viewports: [], persistence: {}, fixturesRemoved: false, apiJobsUsed: 0 };
try {
  fixtures = await createBrowserFixtures(browser, baseUrl);
  const fixtureIds = fixtures.ids;
  const fixturePaths = fixtures.ownedPaths;
  const sourceId = fixtureIds.complete;
  const accessEnabled = Boolean(process.env.DEMO_ACCESS_CODE?.trim());
  const anonymous = await browser.newContext();
  const anonymousPage = await anonymous.newPage();
  const anonymousResponse = await anonymousPage.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  results.access = { enabled: accessEnabled, anonymousStatus: anonymousResponse?.status(), anonymousPath: new URL(anonymousPage.url()).pathname };
  if (accessEnabled) {
    if (results.access.anonymousPath !== "/demo-access") throw new Error("Enabled access gate did not redirect anonymous page");
    const invalid = await anonymous.request.post(`${baseUrl}/api/demo-access`, { data: { code: "definitely-invalid-local-regression-code" } });
    results.access.invalidCodeStatus = invalid.status();
    if (invalid.status() !== 401) throw new Error("Invalid access code was not rejected");
    const valid = await anonymous.request.post(`${baseUrl}/api/demo-access`, { data: { code: process.env.DEMO_ACCESS_CODE } });
    results.access.validCodeStatus = valid.status();
    results.access.httpOnlyCookieIssued = /marketarc_demo_access=.*HttpOnly/i.test(valid.headers()["set-cookie"] ?? "");
    if (valid.status() !== 200 || !results.access.httpOnlyCookieIssued) throw new Error("Valid access configuration did not issue the protected cookie");
  } else if (results.access.anonymousPath !== "/") throw new Error("Disabled access gate did not allow the home page");
  await anonymous.close();

  for (const viewport of [{ id: "desktop", width: 1440, height: 1000 }, { id: "mobile", width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    if (accessEnabled) {
      const token = createHmac("sha256", process.env.DEMO_ACCESS_CODE.trim()).update("marketarc-demo-access-v1").digest("base64url");
      await context.addCookies([{ name: "marketarc_demo_access", value: token, url: baseUrl, httpOnly: true, sameSite: "Lax" }]);
    }
    const page = await context.newPage();
    const failedAssets = [];
    page.on("response", (response) => { if (response.status() >= 400 && /\.(css|js)(\?|$)/.test(response.url())) failedAssets.push({ status: response.status(), path: new URL(response.url()).pathname }); });

    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "开始分析" }).click();
    const emptyError = await page.locator("#question-error").innerText();
    if (!emptyError.includes("请输入")) throw new Error("Empty question failure is not understandable");
    const apiError = await context.request.post(`${baseUrl}/api/analyze`, { data: { question: "" } });
    if (apiError.status() !== 400 || !((await apiError.json()).message ?? "").includes("请输入")) throw new Error("Analysis API invalid-question failure regressed");
    if (viewport.id === "desktop") {
      const cachedSubmission = await context.request.post(`${baseUrl}/api/analyze`, { data: { question: "美联储为什么降息？" } });
      const cachedPayload = await cachedSubmission.json();
      if (cachedSubmission.status() !== 200 || cachedPayload.status !== "complete" || typeof cachedPayload.jobId !== "string") throw new Error("Cached successful question submission regressed");
      fixturePaths.push(path.join(jobsDirectory, `${cachedPayload.jobId}.json`));
      const cachedStatus = await context.request.get(`${baseUrl}/api/analyze/status?id=${encodeURIComponent(cachedPayload.jobId)}`);
      const cachedJob = await cachedStatus.json();
      if (cachedStatus.status() !== 200 || cachedJob.status !== "complete" || !cachedJob.analysisStory) throw new Error("Cached submission did not produce a complete persisted result");
      results.api.cachedSubmission = { postStatus: cachedSubmission.status(), jobStatus: cachedJob.status, persistedStory: true, providerCalls: 0 };
    }

    await page.goto(`${baseUrl}/analysis/job/${fixtureIds.quick}`, { waitUntil: "networkidle" });
    const quick = { quickTake: await page.getByText(/QUICK TAKE/).count(), progressRows: await page.locator("section > .mt-10.grid.gap-3 > div").count() };
    await page.screenshot({ path: path.join(outputDirectory, `${viewport.id}-quick-take.png`), fullPage: true });

    await page.goto(`${baseUrl}/analysis/job/${fixtureIds.partial}`, { waitUntil: "networkidle" });
    const partial = { storyHero: await page.locator(".story-hero").count(), researchContinues: await page.getByText("RESEARCH CONTINUES").count() };
    await page.screenshot({ path: path.join(outputDirectory, `${viewport.id}-story-a-progress.png`), fullPage: true });

    await page.goto(`${baseUrl}/analysis/job/${sourceId}`, { waitUntil: "networkidle" });
    const titleBefore = await page.locator(".story-hero h1").innerText();
    const complete = { assetSections: await page.locator(".story-section").count(), expectation: await page.locator(".expectation-section").count(), watchlist: await page.locator(".watchlist-grid").count(), mentalModel: await page.locator(".story-finale").count() };
    await page.screenshot({ path: path.join(outputDirectory, `${viewport.id}-complete-story.png`), fullPage: true });
    await page.reload({ waitUntil: "networkidle" });
    const titleAfter = await page.locator(".story-hero h1").innerText();
    if (titleBefore !== titleAfter) throw new Error("Complete story did not persist across refresh");
    results.persistence[viewport.id] = { sameTitleAfterRefresh: true };

    const statusResponse = await context.request.get(`${baseUrl}/api/analyze/status?id=${sourceId}`);
    const statusPayload = await statusResponse.json();
    if (statusResponse.status() !== 200 || statusPayload.status !== "complete" || !statusPayload.analysisStory) throw new Error("Completed job cache/status regression");
    results.api[viewport.id] = { status: statusResponse.status(), cacheControl: statusResponse.headers()["cache-control"], jobStatus: statusPayload.status };

    await page.goto(`${baseUrl}/analysis/job/${fixtureIds.failed}`, { waitUntil: "networkidle" });
    const failed = { message: await page.getByText("这次研究没有成功完成。").count(), retry: await page.getByRole("button", { name: "重新尝试" }).count() };

    await page.goto(`${baseUrl}/today`, { waitUntil: "networkidle" });
    const today = { items: await page.locator(".today-item").count(), boundaries: await page.locator(".today-boundary").count(), background: await page.locator(".today-market").evaluate((element) => getComputedStyle(element).backgroundColor) };
    const links = await page.locator(".today-deep-link").evaluateAll((elements) => elements.map((element) => element.getAttribute("href")));
    for (const href of links) {
      const linkedPage = await context.newPage();
      try {
        const linkedResponse = await linkedPage.goto(new URL(href, baseUrl).href, { waitUntil: "networkidle" });
        if (linkedResponse.status() !== 200 || await linkedPage.locator(".story-hero").count() !== 1) throw new Error(`Today link has no bundled story: ${href}`);
        const hash = new URL(href, baseUrl).hash;
        if (hash && await linkedPage.locator(hash).count() !== 1) throw new Error(`Today link anchor missing: ${href}`);
      } finally { await linkedPage.close(); }
    }
    today.linkedStories = links.length;
    await page.screenshot({ path: path.join(outputDirectory, `${viewport.id}-today.png`), fullPage: true });

    await page.goto(`${baseUrl}/map`, { waitUntil: "networkidle" });
    const tabs = page.getByRole("tab");
    const visited = [];
    for (let index = 0; index < await tabs.count(); index += 1) { await tabs.nth(index).click(); visited.push(await page.locator(".map-path h2").innerText()); }
    const map = { tabs: await tabs.count(), uniqueHeadings: new Set(visited).size, counterconditions: await page.locator(".map-conditions article").count(), background: await page.locator(".investment-map").evaluate((element) => getComputedStyle(element).backgroundColor) };
    await page.screenshot({ path: path.join(outputDirectory, `${viewport.id}-map.png`), fullPage: true });

    const dimensions = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth), styleSheets: document.styleSheets.length }));
    const result = { viewport, emptyError: true, quick, partial, complete, failed, today, map, failedAssets, dimensions };
    results.viewports.push(result);
    if (quick.quickTake !== 1 || quick.progressRows !== 6 || partial.storyHero !== 1 || partial.researchContinues !== 1 || complete.expectation !== 1 || complete.watchlist !== 1 || complete.mentalModel !== 1 || failed.message !== 1 || failed.retry !== 1 || today.items !== 3 || today.boundaries !== 9 || today.background !== "rgb(9, 10, 12)" || map.tabs !== 3 || map.uniqueHeadings !== 3 || map.counterconditions !== 2 || map.background !== "rgb(9, 10, 12)" || failedAssets.length || dimensions.styleSheets < 1 || dimensions.scrollWidth > dimensions.clientWidth) throw new Error(`Critical journey failed at ${viewport.id}`);
    await context.close();
  }
} finally {
  await browser.close();
  await fixtures?.cleanup();
  results.fixturesRemoved = true;
  await writeFile(path.join(outputDirectory, "full-product-regression.json"), `${JSON.stringify(results, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({ status: "PASS", outputDirectory, access: results.access, viewports: results.viewports.map((item) => ({ id: item.viewport.id, failedAssets: item.failedAssets.length, scrollWidth: item.dimensions.scrollWidth, clientWidth: item.dimensions.clientWidth })), persistence: results.persistence, fixturesRemoved: results.fixturesRemoved, apiJobsUsed: 0 }));
