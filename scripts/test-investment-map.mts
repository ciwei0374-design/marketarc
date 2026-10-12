import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolveInvestmentMapState } from "../src/lib/investment-map.ts";

const source = JSON.parse(await readFile(new URL("../data/market/investment-map.json", import.meta.url), "utf8"));
const available = resolveInvestmentMapState(source);
assert.equal(available.status, "available");
assert.equal(available.data.paths.length, 3);
for (const path of available.data.paths) {
  assert.ok(path.assetEffects.length >= 3);
  assert.ok(path.counterconditions.length >= 2);
  assert.ok(path.watchSignals.every((signal) => signal.rising && signal.falling));
  assert.ok(path.assetEffects.every((effect) => ["可能承压", "可能受益", "影响分化"].includes(effect.tendency)));
}
assert.equal(resolveInvestmentMapState({ ...source, paths: [] }).status, "empty");
assert.throws(() => resolveInvestmentMapState({ ...source, paths: [{ id: "deterministic" }] }), /格式不完整/);
console.log("Investment Map regression: available, empty, conditional effects, and invalid-data states PASS");
