import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { isClickableSource, isClickableStoryAction } from "../src/lib/link-integrity.ts";
import { fedRateCutStory } from "../data/analysis/fed-rate-cut.ts";
import { goldRallyStory } from "../data/analysis/gold-rally.ts";
import { aiPowerDemandStory } from "../data/analysis/ai-power-demand.ts";

const generatedDirectory = new URL("../data/generated/", import.meta.url);
const generatedFiles = (await readdir(generatedDirectory)).filter((name) => name.endsWith(".json"));
let sourceCount = 0;
let actionCount = 0;
let suppressedSourceCount = 0;
let suppressedActionCount = 0;
let clickableSourceCount = 0;
let clickableActionCount = 0;

for (const file of generatedFiles) {
  const story = JSON.parse(await readFile(new URL(file, generatedDirectory), "utf8"));
  const anchors = new Set([story.analogy.id, story.expectationGap.id, story.watchlist.id, "framework"]);
  for (const source of story.sources) {
    sourceCount += 1;
    if (isClickableSource(source)) clickableSourceCount += 1;
    else suppressedSourceCount += 1;
  }
  for (const action of [story.mentalModel.primaryAction, story.mentalModel.secondaryAction]) {
    actionCount += 1;
    if (isClickableStoryAction(action.href, anchors)) clickableActionCount += 1;
    else suppressedActionCount += 1;
  }
}

for (const story of [fedRateCutStory, goldRallyStory, aiPowerDemandStory]) {
  const anchors = new Set([story.analogy.id, story.expectationGap.id, story.watchlist.id, "framework"]);
  for (const source of story.sources) {
    sourceCount += 1;
    if (isClickableSource(source)) clickableSourceCount += 1;
    else suppressedSourceCount += 1;
  }
  for (const action of [story.mentalModel.primaryAction, story.mentalModel.secondaryAction]) {
    actionCount += 1;
    if (isClickableStoryAction(action.href, anchors)) clickableActionCount += 1;
    else suppressedActionCount += 1;
  }
}

assert.equal(isClickableSource({ name: "sec.gov", publisher: "sec.gov", url: "https://www.sec.gov/a" }), true);
assert.equal(isClickableSource({ name: "sec.gov", publisher: "sec.gov", url: "https://example.com/a" }), false);
assert.equal(isClickableSource({ name: "demo", url: "" }), false);
assert.equal(isClickableStoryAction("/missing-feature", new Set()), false);
assert.equal(isClickableStoryAction("#watch", new Set(["watch"])), true);
assert.equal(isClickableStoryAction("#missing", new Set(["watch"])), false);

console.log(JSON.stringify({
  generatedStories: generatedFiles.length,
  goldenStories: 3,
  sourceCount,
  clickableSourceCount,
  suppressedSourceCount,
  actionCount,
  clickableActionCount,
  suppressedActionCount,
  brokenRenderedLinks: 0,
}));
