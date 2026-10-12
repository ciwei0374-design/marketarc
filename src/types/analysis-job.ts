import type { AnalysisStory } from "./analysis";
import type { ResearchBrief } from "./research-brief";
import type { PartialStoryA, PartialStoryB } from "@/services/ai/partial-story-schema";

export type AnalysisJobStatus = "queued" | "researching" | "analyzing" | "story_a" | "story_b" | "complete" | "failed";

export type AnalysisJob = {
  id: string;
  question: string;
  status: AnalysisJobStatus;
  createdAt: string;
  updatedAt: string;
  progress: {
    current: AnalysisJobStatus;
    completed: Array<"research" | "researchBrief" | "storyA" | "storyB">;
  };
  researchSummary: {
    sources: number;
    primary: number;
    official: number;
    primaryCoverage: string;
  } | null;
  researchContextRef: string | null;
  researchBrief: ResearchBrief | null;
  partialStoryA: PartialStoryA | null;
  partialStoryB: PartialStoryB | null;
  analysisStory: AnalysisStory | null;
  error: string | null;
};
