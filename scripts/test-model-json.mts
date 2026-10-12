import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseModelJson } from "../src/services/ai/model-json.ts";

const generated = JSON.parse(await readFile(new URL("../data/generated/a987da3ed4d3160b43dcf539153e348f166671c0c80c86c8df72a08038040561.json", import.meta.url), "utf8"));
const storyB = {
  assetSections: generated.assetSections,
  expectationGap: generated.expectationGap,
  watchlist: generated.watchlist,
  reviewFramework: generated.reviewFramework,
  mentalModel: generated.mentalModel,
};
const plain = JSON.stringify(storyB);
const encoded = JSON.stringify(plain);

assert.deepEqual(parseModelJson(plain), storyB, "plain company-earnings Story B should remain unchanged");
assert.deepEqual(parseModelJson(encoded), storyB, "captured Nvidia whole-object JSON string pattern should unwrap");
assert.deepEqual(parseModelJson(`\`\`\`json\n${encoded}\n\`\`\``), storyB, "fenced encoded JSON should unwrap");
assert.deepEqual(parseModelJson(`{"unfinished": "thought",\nI'll explain this first.\n${plain}`), storyB, "a complete JSON object after malformed prose should be recoverable");
assert.deepEqual(parseModelJson(`{"unfinished": "thought",\nI'll explain this first.\n${plain}`, (value) => Boolean(value && typeof value === "object" && "assetSections" in value)), storyB, "shape guard should skip unrelated nested objects");

for (const file of [
  "../data/generated/0789dd515ffd380c8e716bfac861f22c87131fb7cefb9d0d12653cf76a517ac3.json",
  "../data/generated/e6c38d6b50640c4700bf20a97067758c7b591211af4729992a22604879df4f84.json",
]) {
  const fixture = JSON.parse(await readFile(new URL(file, import.meta.url), "utf8"));
  assert.deepEqual(parseModelJson(JSON.stringify(fixture)), fixture, `${file} should parse without regression`);
}

console.log("model JSON reliability fixtures: PASS");
