import assert from "node:assert/strict";
import { parseModelJson } from "../src/services/ai/model-json.ts";
import { fedRateCutStory } from "../data/analysis/fed-rate-cut.ts";
import { goldRallyStory } from "../data/analysis/gold-rally.ts";
import { aiPowerDemandStory } from "../data/analysis/ai-power-demand.ts";

const generated = fedRateCutStory;
const storyB = {
  assetSections: generated.assetSections,
  expectationGap: generated.expectationGap,
  watchlist: generated.watchlist,
  reviewFramework: generated.reviewFramework,
  mentalModel: generated.mentalModel,
};
const plain = JSON.stringify(storyB);
const encoded = JSON.stringify(plain);

assert.deepEqual(parseModelJson(plain), storyB, "plain Story B should remain unchanged");
assert.deepEqual(parseModelJson(encoded), storyB, "whole-object JSON string failure pattern should unwrap");
assert.deepEqual(parseModelJson(`\`\`\`json\n${encoded}\n\`\`\``), storyB, "fenced encoded JSON should unwrap");
assert.deepEqual(parseModelJson(`{"unfinished": "thought",\nI'll explain this first.\n${plain}`), storyB, "a complete JSON object after malformed prose should be recoverable");
assert.deepEqual(parseModelJson(`{"unfinished": "thought",\nI'll explain this first.\n${plain}`, (value) => Boolean(value && typeof value === "object" && "assetSections" in value)), storyB, "shape guard should skip unrelated nested objects");

for (const fixture of [goldRallyStory, aiPowerDemandStory]) {
  assert.deepEqual(parseModelJson(JSON.stringify(fixture)), fixture, `${fixture.slug} should parse without regression`);
}
assert.deepEqual(parseModelJson(JSON.stringify(encoded)), storyB, "double encoding should unwrap within the bounded limit");
assert.throws(() => parseModelJson("not JSON"), SyntaxError);

console.log("model JSON reliability fixtures: PASS");
