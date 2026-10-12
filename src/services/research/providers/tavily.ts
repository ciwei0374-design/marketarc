import type { PrimarySourceCoverage, ResearchContext, ResearchSource, ResearchSourceTier, ResearchSourceType, ResearchProvider } from "../types";
import { planResearch } from "../ai-planner";
import { createRuleBasedResearchPlan } from "../research-plan";

type TavilyTopic = "finance" | "news" | "general";
type TavilyTimeRange = "day" | "week" | "month";
type TavilyResult = { title?: unknown; url?: unknown; content?: unknown; published_date?: unknown; score?: unknown };
type TavilyResponse = { results?: TavilyResult[]; usage?: { credits?: number } };

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";
const officialDomains = [
  "federalreserve.gov", "boj.or.jp", "hkma.gov.hk", "gov.hk", "rvd.gov.hk", "censtatd.gov.hk",
  "stats.gov.cn", "stats.gov.hk", "sec.gov", "csrc.gov.cn", "pbc.gov.cn", "treasury.gov",
  "imf.org", "worldbank.org", "oecd.org", "bis.org", "ecb.europa.eu",
];
const newsDomains = [
  "reuters.com", "bloomberg.com", "ft.com", "wsj.com", "cnbc.com", "nikkei.com", "economist.com",
  "stcn.com", "cs.com.cn", "cls.cn",
];
const researchDomains = ["nber.org", "brookings.edu", "piie.com", "ssrn.com", "sciencedirect.com"];
const isDevelopment = process.env.NODE_ENV === "development";

type PlannedQuery = { query: string; includeDomains?: string[]; phase: "primary" | "context"; target?: string };

function chooseTopic(question: string): TavilyTopic {
  if (/今天|刚刚|本周|最新|这次|目前|突发|宣布|新闻/.test(question)) return "news";
  if (/是什么|概念|原理|如何理解/.test(question) && !/市场|股票|债券|汇率|利率|公司|经济/.test(question)) return "general";
  return "finance";
}

function chooseTimeRange(question: string): TavilyTimeRange | undefined {
  if (/今天|刚刚|突发/.test(question)) return "day";
  if (/本周/.test(question)) return "week";
  if (/最近|最新|这次|目前/.test(question)) return "month";
  return undefined;
}

function isHongKongDollarQuestion(question: string) {
  return /港(?:币|幣|元)|HKD|Hong Kong dollar|联系汇率|聯繫匯率/i.test(question);
}

function publishedDateOf(value: string | null, url: string) {
  if (value && Number.isFinite(Date.parse(value))) return value;
  if (!/^https:\/\/(www\.)?hkma\.gov\.hk\//i.test(url)) return null;
  const match = url.match(/\/(20\d{2})\/(0[1-9]|1[0-2])\/\1\2([0-3]\d)(?:-|\/|$)/);
  if (!match) return null;
  const date = `${match[1]}-${match[2]}-${match[3]}`;
  return Number.isFinite(Date.parse(date)) ? date : null;
}

function isRelevantHongKongDollarSource(title: string, snippet: string, isPrimary: boolean, publishedAt: string | null, searchedAt: string) {
  if (!/港(?:币|幣|元)|HKD|Hong Kong dollar|linked exchange rate|convertibility|联系汇率|聯繫匯率/i.test(`${title} ${snippet}`)) return false;
  if (!publishedAt) return isPrimary;
  const publishedMs = Date.parse(publishedAt);
  const ageMs = Date.parse(searchedAt) - publishedMs;
  return Number.isFinite(ageMs) && ageMs >= -86_400_000 && ageMs <= (isPrimary ? 365 : 90) * 86_400_000;
}

function hostname(url: string) {
  return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
}

function sourceTypeFor(domain: string, url: string): ResearchSourceType {
  if (/investor|investors|ir\./i.test(`${domain}${url}`)) return "company";
  if (/statistics|stat\.|census|censtat|bea\.gov|bls\.gov/i.test(`${domain}${url}`)) return "statistics";
  if (officialDomains.some((official) => domain === official || domain.endsWith(`.${official}`)) || /\.(gov|gov\.[a-z]{2}|go\.[a-z]{2})$/i.test(domain)) return "official";
  if (newsDomains.some((news) => domain === news || domain.endsWith(`.${news}`))) return "news";
  if (researchDomains.some((research) => domain === research || domain.endsWith(`.${research}`)) || /research|institute|university|\.edu$/i.test(`${domain}${url}`)) return "research";
  return "other";
}

function sourceTierFor(type: ResearchSourceType): ResearchSourceTier {
  if (type === "official" || type === "company" || type === "statistics") return 1;
  if (type === "news") return 2;
  if (type === "research") return 3;
  return 4;
}

async function search(planned: PlannedQuery, topic: TavilyTopic, timeRange: TavilyTimeRange | undefined, apiKey: string) {
  const response = await fetch(TAVILY_SEARCH_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: planned.query,
      topic,
      search_depth: "advanced",
      chunks_per_source: 2,
      max_results: 5,
      time_range: timeRange,
      include_answer: false,
      include_raw_content: false,
      include_images: false,
      include_usage: true,
      ...(planned.includeDomains?.length ? { include_domains: planned.includeDomains } : {}),
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`Tavily HTTP ${response.status}`);
  return await response.json() as TavilyResponse;
}

export class TavilyResearchProvider implements ResearchProvider {
  readonly id = "tavily";

  async research(question: string): Promise<ResearchContext> {
    const apiKey = process.env.TAVILY_API_KEY?.trim();
    const plannedResearch = apiKey
      ? await planResearch(question)
      : { plan: createRuleBasedResearchPlan(question), source: "rule-fallback" as const, durationMs: 0 };
    const plan = plannedResearch.plan;
    const plannedQueries: PlannedQuery[] = [
      ...plan.primaryQueries.map((query, index) => {
        const target = plan.primaryTargets[index] ?? plan.primaryTargets[0];
        return { query, includeDomains: target ? [target.domain] : undefined, phase: "primary" as const, target: target?.name };
      }),
      ...plan.contextQueries.map((query) => ({ query, includeDomains: newsDomains, phase: "context" as const, target: "High-quality financial media" })),
    ].slice(0, 5);
    const queries = plannedQueries.map((item) => item.query);
    if (isDevelopment) console.log(`[timing] planner: ${plannedResearch.durationMs}ms`);
    if (isDevelopment) console.log("[research-planner] result", { source: plannedResearch.source, topic: plan.topic, primaryTargets: plan.primaryTargets.map((target) => ({ name: target.name, domain: target.domain })) });
    const searchedAt = new Date().toISOString();
    const primaryExpected = plan.primaryTargets.length > 0;
    if (!apiKey) return { provider: this.id, query: question, queries, searched: false, searchedAt: null, status: "unavailable", usageCredits: null, primarySourceCoverage: primaryExpected ? "low" : "not-applicable", sources: [], facts: [] };

    const topic = chooseTopic(question);
    const timeRange = chooseTimeRange(question);
    if (isDevelopment) console.log("[research] plan", { topic: plan.topic, primaryExpected, primaryTargets: plan.primaryTargets.map((target) => target.name) });
    if (isDevelopment) console.log("[research] tavily search started", { queries: plannedQueries, topic, timeRange: timeRange ?? "none" });
    const searchWallStartedAt = performance.now();
    const responses = await Promise.allSettled(plannedQueries.map(async (planned, index) => {
      const searchStartedAt = performance.now();
      try {
        const response = await search(planned, topic, timeRange, apiKey);
        if (isDevelopment) console.log("[timing] tavily query", {
          index: index + 1,
          type: planned.phase,
          duration_ms: Math.round(performance.now() - searchStartedAt),
          result_count: response.results?.length ?? 0,
        });
        return response;
      } catch (error) {
        if (isDevelopment) console.log("[timing] tavily query", {
          index: index + 1,
          type: planned.phase,
          duration_ms: Math.round(performance.now() - searchStartedAt),
          result_count: 0,
          status: "failed",
        });
        throw error;
      }
    }));
    if (isDevelopment) console.log(`[timing] search wall: ${Math.round(performance.now() - searchWallStartedAt)}ms`);
    const successful = responses.flatMap((result, index) => result.status === "fulfilled" ? [{ response: result.value, planned: plannedQueries[index] }] : []);
    const credits = successful.reduce((total, result) => total + (result.response.usage?.credits ?? 0), 0);
    const deduplicated = new Map<string, Omit<ResearchSource, "id"> & { score: number; phase: "primary" | "context"; target?: string }>();

    let classificationDuration = 0;
    const processingStartedAt = performance.now();
    for (const { response, planned } of successful) {
      for (const result of response.results ?? []) {
        if (typeof result.url !== "string" || typeof result.title !== "string" || typeof result.content !== "string") continue;
        try {
          const url = new URL(result.url).toString();
          const domain = hostname(url);
          const classificationStartedAt = performance.now();
          const sourceType = sourceTypeFor(domain, url);
          const sourceTier = sourceTierFor(sourceType);
          classificationDuration += performance.now() - classificationStartedAt;
          const publishedAt = publishedDateOf(typeof result.published_date === "string" ? result.published_date : null, url);
          const snippet = result.content.replace(/\s+/g, " ").trim().slice(0, 350);
          if (isHongKongDollarQuestion(question) && !isRelevantHongKongDollarSource(result.title, snippet, sourceTier === 1, publishedAt, searchedAt)) continue;
          const candidate = {
            title: result.title.trim(), publisher: domain, url,
            publishedAt,
            snippet, sourceType,
            sourceTier,
            isPrimary: sourceTier === 1,
            score: typeof result.score === "number" ? result.score : 0,
            phase: planned.phase,
            target: planned.target,
          };
          const existing = deduplicated.get(url);
          if (!existing || candidate.score > existing.score) deduplicated.set(url, candidate);
        } catch { /* Ignore invalid result URLs. */ }
      }
    }
    if (isDevelopment) {
      const processingDuration = performance.now() - processingStartedAt;
      console.log(`[timing] source classification: ${Math.round(classificationDuration)}ms`);
      console.log(`[timing] source deduplication: ${Math.round(Math.max(0, processingDuration - classificationDuration))}ms`);
    }

    const contextBuildStartedAt = performance.now();
    const candidates = [...deduplicated.values()];
    const primaryCandidates = candidates.filter((source) => source.isPrimary).sort((left, right) => Number(right.phase === "primary") - Number(left.phase === "primary") || right.score - left.score);
    const primary: typeof primaryCandidates = [];
    for (const target of plan.primaryTargets) {
      const bestForTarget = primaryCandidates.find((source) => source.target === target.name && !primary.includes(source));
      if (bestForTarget) primary.push(bestForTarget);
    }
    for (const candidate of primaryCandidates) {
      if (primary.length >= 4) break;
      if (!primary.includes(candidate)) primary.push(candidate);
    }
    const supporting = candidates.filter((source) => !source.isPrimary && source.sourceTier < 4).sort((left, right) => left.sourceTier - right.sourceTier || right.score - left.score).slice(0, 4);
    const fallback = candidates.filter((source) => !source.isPrimary && !supporting.includes(source)).sort((left, right) => left.sourceTier - right.sourceTier || right.score - left.score);
    const sources = [...primary, ...supporting, ...fallback].slice(0, 8)
      .map((source, index) => ({
        id: `source-${index + 1}`,
        title: source.title,
        publisher: source.publisher,
        url: source.url,
        publishedAt: source.publishedAt,
        snippet: source.snippet,
        sourceType: source.sourceType,
        sourceTier: source.sourceTier,
        isPrimary: source.isPrimary,
      }));
    const facts = sources.filter((source) => source.snippet).map((source) => ({ statement: source.snippet.slice(0, 180), sourceIds: [source.id] }));
    const primaryCount = sources.filter((source) => source.isPrimary).length;
    const primarySourceCoverage: PrimarySourceCoverage = !primaryExpected ? "not-applicable" : primaryCount === 0 ? "low" : primaryCount < Math.min(2, plan.primaryTargets.length) ? "medium" : "high";
    if (isDevelopment) console.log(`[timing] ResearchContext build: ${Math.round(performance.now() - contextBuildStartedAt)}ms`);
    if (isDevelopment) console.log("[research] tavily search completed", {
      queries: queries.length,
      successfulQueries: successful.length,
      sources: sources.length,
      primarySources: primaryCount,
      officialSources: sources.filter((source) => source.sourceType === "official").length,
      tier1Sources: sources.filter((source) => source.sourceTier === 1).length,
      tier2Sources: sources.filter((source) => source.sourceTier === 2).length,
      primarySourceCoverage,
      credits: successful.length > 0 ? credits : "unavailable",
    });

    return {
      provider: this.id, query: question, queries,
      searched: sources.length > 0,
      searchedAt: sources.length > 0 ? searchedAt : null,
      status: sources.length > 0 ? "completed" : "unavailable",
      usageCredits: successful.length > 0 ? credits : null,
      primarySourceCoverage,
      sources, facts,
    };
  }
}
