import "server-only";
import type { ResearchProvider } from "./types";
import { NoResearchProvider } from "./providers/none";
import { TavilyResearchProvider } from "./providers/tavily";

export function getResearchProvider(): ResearchProvider {
  const provider = process.env.SEARCH_PROVIDER?.trim() || "none";
  switch (provider) {
    case "none":
      return new NoResearchProvider();
    case "tavily":
      return new TavilyResearchProvider();
    default:
      throw new Error(`Unsupported research provider: ${provider}`);
  }
}
