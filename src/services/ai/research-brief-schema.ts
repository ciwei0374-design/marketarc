import { z } from "zod";
import type { ResearchBrief } from "@/types/research-brief";

export const researchBriefSchema = z.object({
  question: z.string(),
  thesis: z.string(),
  whatHappened: z.array(z.string()).min(3).max(4),
  causalChain: z.array(z.string()).min(3).max(6),
  keyDrivers: z.array(z.string()).min(2).max(4),
  expectationGap: z.object({ marketExpected: z.string(), actualOrCurrent: z.string(), whyItMatters: z.string() }),
  counterArguments: z.array(z.string()).min(2).max(3),
  assetImpacts: z.array(z.object({ asset: z.string(), mechanism: z.string() })).min(2).max(4),
  watchlist: z.array(z.object({ indicator: z.string(), why: z.string() })).min(3).max(5),
  sourcesUsed: z.array(z.string()).max(8),
  confidence: z.enum(["low", "medium", "high"]),
});

export const researchBriefJsonSchema = z.toJSONSchema(researchBriefSchema);

export function parseResearchBrief(value: unknown): ResearchBrief {
  return researchBriefSchema.parse(value);
}
