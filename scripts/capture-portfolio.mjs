import { mkdir } from "node:fs/promises";
import path from "node:path";
import { launchBrowser, authorizeContext } from "./browser-test-utils.mjs";

const baseUrl = process.env.MARKETARC_DOCS_BASE_URL || "http://localhost:3102";
const directory = path.join(process.cwd(), "docs", "assets");
await mkdir(directory, { recursive: true });
const browser = await launchBrowser();
try {
  for (const [name, route, viewport, selector] of [
    ["home-desktop", "/", { width: 1440, height: 1000 }, null],
    ["story-desktop", `/analysis?q=${encodeURIComponent("美联储为什么降息？")}`, { width: 1440, height: 1000 }, ".expectation-section"],
    ["map-desktop", "/map", { width: 1440, height: 1000 }, null],
    ["story-mobile", `/analysis?q=${encodeURIComponent("黄金为什么持续上涨？")}`, { width: 390, height: 844 }, ".insight-section"],
  ]) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    await authorizeContext(context, baseUrl);
    const page = await context.newPage();
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    if (response.status() !== 200) throw new Error(`Cannot capture ${route}`);
    if (selector) await page.locator(selector).screenshot({ path: path.join(directory, `${name}.png`) });
    else await page.screenshot({ path: path.join(directory, `${name}.png`) });
    await context.close();
  }
} finally { await browser.close(); }
console.log("Captured 4 portfolio screenshots from bundled examples; real API calls: 0");
