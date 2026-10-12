export type ResearchSourceType = "official" | "company" | "statistics" | "news" | "research" | "other";
export type ResearchSourceTier = 1 | 2 | 3 | 4;
export type PrimarySourceCoverage = "not-applicable" | "low" | "medium" | "high";

export type ResearchSource = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string | null;
  snippet: string;
  sourceType: ResearchSourceType;
  sourceTier: ResearchSourceTier;
  isPrimary: boolean;
};

export type ResearchFact = {
  statement: string;
  sourceIds: string[];
};

export type ResearchContext = {
  provider: string;
  query: string;
  queries: string[];
  searched: boolean;
  searchedAt: string | null;
  status: "not-performed" | "completed" | "unavailable";
  usageCredits: number | null;
  primarySourceCoverage: PrimarySourceCoverage;
  sources: ResearchSource[];
  facts: ResearchFact[];
};

export type ResearchPromptContext = ResearchContext & {
  disclosure: string;
  context: string;
};

export interface ResearchProvider {
  readonly id: string;
  research(question: string): Promise<ResearchContext>;
}
