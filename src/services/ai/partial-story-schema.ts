import { z } from "zod";
import { analysisStorySchema, parseAnalysisStory } from "./analysis-schema";
import type { AnalysisStory } from "@/types/analysis";

export const partialStoryASchema = analysisStorySchema.pick({
  slug: true,
  topic: true,
  category: true,
  eyebrow: true,
  title: true,
  subtitle: true,
  disclaimer: true,
  hook: true,
  analogy: true,
  background: true,
  keyInsight: true,
  evidence: true,
});

export const partialStoryBSchema = analysisStorySchema.pick({
  assetSections: true,
  expectationGap: true,
  watchlist: true,
  reviewFramework: true,
  mentalModel: true,
});

export const partialStoryAJsonSchema = z.toJSONSchema(partialStoryASchema);
export const partialStoryBJsonSchema = z.toJSONSchema(partialStoryBSchema);
export type PartialStoryA = z.infer<typeof partialStoryASchema>;
export type PartialStoryB = z.infer<typeof partialStoryBSchema>;

export function mergeAnalysisStory(storyA: PartialStoryA, storyB: PartialStoryB): AnalysisStory {
  return parseAnalysisStory({
    ...storyA,
    ...storyB,
    sources: [{ name: "ResearchContext", description: "Source metadata is mapped by the server.", title: "ResearchContext", publisher: "ResearchContext", url: "", date: "" }],
    sourceLabel: "ResearchContext sources pending",
    methodology: "Source metadata is mapped deterministically after story composition.",
  });
}
