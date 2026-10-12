import type { ResearchContext, ResearchProvider } from "../types";

export class NoResearchProvider implements ResearchProvider {
  readonly id = "none";

  async research(question: string): Promise<ResearchContext> {
    return {
      provider: this.id,
      query: question,
      queries: [],
      searched: false,
      searchedAt: null,
      status: "not-performed",
      usageCredits: null,
      primarySourceCoverage: "not-applicable",
      sources: [],
      facts: [],
    };
  }
}
