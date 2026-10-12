import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolveTodayMarketState } from "../src/lib/today-market.ts";

const source = JSON.parse(await readFile(new URL("../data/market/today-market.json", import.meta.url), "utf8"));
const available = resolveTodayMarketState(source);
assert.equal(available.status, "available");
assert.equal(available.snapshot.items.length, 3);
assert.deepEqual(available.snapshot.items.map((item) => item.order), [1, 2, 3]);
for (const item of available.snapshot.items) {
  assert.ok(item.facts.length > 0, `${item.id}: FACT required`);
  assert.ok(item.inference.length > 0, `${item.id}: INFERENCE required`);
  assert.ok(item.uncertainty.length > 0, `${item.id}: UNCERTAINTY required`);
  assert.match(item.analysisHref, /^\/analysis\/job\/[a-f0-9-]+$/);
}

const empty = resolveTodayMarketState({ ...source, items: [] });
assert.equal(empty.status, "empty");
assert.throws(() => resolveTodayMarketState({ ...source, items: [{ id: "broken" }] }), /格式不完整/);
assert.throws(() => resolveTodayMarketState({ ...source, date: "today" }), /格式不完整/);
console.log("Today Market regression: available, empty, and invalid-data states PASS");
