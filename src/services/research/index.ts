export { getResearchProvider } from "./provider";
export type { PrimarySourceCoverage, ResearchContext, ResearchFact, ResearchProvider, ResearchPromptContext, ResearchSource, ResearchSourceTier, ResearchSourceType } from "./types";

import type { ResearchContext, ResearchPromptContext } from "./types";

export function toResearchPromptContext(research: ResearchContext): ResearchPromptContext {
  if (!research.searched) {
    return {
      ...research,
      disclosure: research.status === "unavailable" ? "实时研究暂不可用。" : "本次分析未使用实时联网研究。",
      context: "当前没有可用的实时检索结果。不要声称获得了最新信息，不要编造实时数据或已核验来源。",
    };
  }

  const primarySources = research.sources.filter((source) => source.isPrimary).slice(0, 4);
  const contextSources = research.sources.filter((source) => !source.isPrimary).slice(0, Math.max(0, 6 - primarySources.length));
  const promptSources = [...primarySources, ...contextSources].map((source) => ({ ...source, snippet: source.snippet.slice(0, 180) }));
  const promptSourceIds = new Set(promptSources.map((source) => source.id));
  const promptFacts = research.facts
    .filter((fact) => fact.sourceIds.some((sourceId) => promptSourceIds.has(sourceId)))
    .slice(0, 6)
    .map((fact) => ({ ...fact, statement: fact.statement.slice(0, 140) }));
  const context = `SEARCHED RESEARCH CONTEXT\n规则：搜索时间不等于事实发生时间；没有直接相关且带日期的来源，不得声称当前汇率、价格、政策或市场预期已经核实；精确数字、政策决定、公司业绩和宏观指标优先使用 isPrimary=true 的来源；每项事实只能引用其 sourceIds 对应来源实际支持的内容，不得跨来源补写；来源冲突时在 counterArguments 中同时说明原始事实与市场解读；不得编造 Context 中不存在的精确数字；明确区分事实与分析；AnalysisStory.sources 最多选择 4 个实际用于分析的来源。\nDATA:\n${JSON.stringify({ query: research.query, searchedAt: research.searchedAt, primarySourceCoverage: research.primarySourceCoverage, sources: promptSources, facts: promptFacts })}`;
  if (process.env.NODE_ENV === "development") console.log("[research] context prepared", { characters: context.length, sources: research.sources.length, facts: research.facts.length });
  return {
    ...research,
    disclosure: `已联网检索 · ${research.sources.length} 个搜索结果 · 检索时间：${research.searchedAt}`,
    context,
  };
}
