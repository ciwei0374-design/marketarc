import type { TodayMarketItem, TodayMarketSnapshot } from "@/types/today-market";

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// Local completed jobs remain supported; public snapshots use bundled examples.
function isAnalysisHref(value: unknown): value is string {
  if (!isText(value)) return false;
  if (/^\/analysis\/job\/[a-f0-9-]+$/.test(value)) return true;
  if (!value.startsWith("/analysis?q=")) return false;
  const url = new URL(value, "https://marketarc.invalid");
  return url.pathname === "/analysis" && url.searchParams.size === 1 &&
    ["美联储为什么降息？", "黄金为什么持续上涨？", "AI 为什么会带动电力需求？"].includes(url.searchParams.get("q") ?? "") &&
    ["", "#stock-valuation", "#expectations"].includes(url.hash);
}

function isItem(value: unknown): value is TodayMarketItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<TodayMarketItem>;
  return (
    isText(item.id) &&
    typeof item.order === "number" &&
    isText(item.category) &&
    isText(item.title) &&
    isText(item.summary) &&
    Array.isArray(item.facts) && item.facts.length > 0 && item.facts.every(isText) &&
    isText(item.inference) &&
    isText(item.uncertainty) &&
    Array.isArray(item.variables) && item.variables.length > 0 &&
    item.variables.every((entry) => isText(entry?.name) && isText(entry?.mechanism)) &&
    Array.isArray(item.watch) && item.watch.length > 0 &&
    item.watch.every((entry) => isText(entry?.indicator) && isText(entry?.signal)) &&
    isAnalysisHref(item.analysisHref)
  );
}

export function parseTodayMarketSnapshot(value: unknown): TodayMarketSnapshot {
  if (!value || typeof value !== "object") throw new Error("今日市场数据不可用");
  const snapshot = value as Partial<TodayMarketSnapshot>;
  if (
    snapshot.version !== "0.1" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(snapshot.date ?? "") ||
    snapshot.timezone !== "Asia/Shanghai" ||
    !isText(snapshot.updatedAt) ||
    !isText(snapshot.freshnessLabel) ||
    !isText(snapshot.title) ||
    !isText(snapshot.lead) ||
    !isText(snapshot.methodology) ||
    !Array.isArray(snapshot.items) ||
    !snapshot.items.every(isItem)
  ) {
    throw new Error("今日市场数据格式不完整");
  }
  return { ...snapshot, items: [...snapshot.items].sort((a, b) => a.order - b.order) } as TodayMarketSnapshot;
}

export function resolveTodayMarketState(value: unknown) {
  const snapshot = parseTodayMarketSnapshot(value);
  return snapshot.items.length === 0 ? { status: "empty" as const, snapshot } : { status: "available" as const, snapshot };
}
