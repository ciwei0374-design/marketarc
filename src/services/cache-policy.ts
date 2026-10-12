const HOUR_MS = 60 * 60 * 1000;

export const MARKET_CACHE_VERSION = "evidence-v3";

export function marketCacheMaxAgeMs(question: string) {
  return /今天|今日|刚刚|本周|最近|最新|这次|目前|突发|实时/.test(question) ? HOUR_MS : 6 * HOUR_MS;
}

export function isFreshMarketCache(timestamp: string | number | null, question: string, now = Date.now()) {
  const savedAt = typeof timestamp === "number" ? timestamp : timestamp ? Date.parse(timestamp) : Number.NaN;
  const age = now - savedAt;
  return Number.isFinite(age) && age >= 0 && age <= marketCacheMaxAgeMs(question);
}
