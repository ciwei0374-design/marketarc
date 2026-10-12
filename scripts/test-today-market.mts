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
  assert.match(item.analysisHref, /^\/analysis\?q=/);
}
for (const href of ["https://evil.example/", "/analysis?q=unknown", "/analysis?q=美联储为什么降息？#missing", "/analysis?q=美联储为什么降息？&extra=1"]) {
  assert.throws(() => resolveTodayMarketState({ ...source, items: [{ ...source.items[0], analysisHref: href }] }), /格式不完整/);
}
assert.equal(resolveTodayMarketState({ ...source, items: [{ ...source.items[0], analysisHref: "/analysis/job/240b1d4e-efa1-4aad-b626-a82af9aaf19c" }] }).status, "available");

const empty = resolveTodayMarketState({ ...source, items: [] });
assert.equal(empty.status, "empty");
assert.throws(() => resolveTodayMarketState({ ...source, items: [{ id: "broken" }] }), /格式不完整/);
assert.throws(() => resolveTodayMarketState({ ...source, date: "today" }), /格式不完整/);
console.log("Today Market regression: available, empty, and invalid-data states PASS");
