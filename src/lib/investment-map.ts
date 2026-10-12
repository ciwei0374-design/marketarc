import type { InvestmentMapData, InvestmentMapPath } from "@/types/investment-map";

function text(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0; }

function path(value: unknown): value is InvestmentMapPath {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<InvestmentMapPath>;
  return text(item.id) && text(item.event) && text(item.eventQuestion) && text(item.plainLanguage) && text(item.mechanismName) &&
    Array.isArray(item.mechanismSteps) && item.mechanismSteps.length >= 3 && item.mechanismSteps.every(text) &&
    Array.isArray(item.assetEffects) && item.assetEffects.length >= 3 && item.assetEffects.every((effect) => text(effect?.assetClass) && ["可能承压", "可能受益", "影响分化"].includes(effect?.tendency) && text(effect?.explanation)) &&
    Array.isArray(item.counterconditions) && item.counterconditions.length >= 2 && item.counterconditions.every((entry) => text(entry?.condition) && text(entry?.consequence)) &&
    Array.isArray(item.watchSignals) && item.watchSignals.length >= 2 && item.watchSignals.every((entry) => text(entry?.indicator) && text(entry?.rising) && text(entry?.falling));
}

export function parseInvestmentMap(value: unknown): InvestmentMapData {
  if (!value || typeof value !== "object") throw new Error("投资地图数据不可用");
  const data = value as Partial<InvestmentMapData>;
  if (data.version !== "0.1" || !text(data.title) || !text(data.lead) || !text(data.methodology) || !Array.isArray(data.paths) || !data.paths.every(path)) throw new Error("投资地图数据格式不完整");
  return data as InvestmentMapData;
}

export function resolveInvestmentMapState(value: unknown) {
  const data = parseInvestmentMap(value);
  return data.paths.length === 0 ? { status: "empty" as const, data } : { status: "available" as const, data };
}
