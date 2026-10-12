import type { AnalysisStory } from "@/types/analysis";
import type { ResearchBrief } from "@/types/research-brief";
import type { ResearchPromptContext } from "@/services/research";
import type { PartialStoryA, PartialStoryB } from "./partial-story-schema";

export type GenerateResearchBriefInput = {
  question: string;
  research: ResearchPromptContext;
  model: string;
};

export type ComposeAnalysisInput = {
  question: string;
  brief: ResearchBrief;
  model: string;
  onStoryAStarted?: () => Promise<void>;
  onStoryACompleted?: (story: PartialStoryA) => Promise<void>;
  onStoryBStarted?: () => Promise<void>;
  onStoryBCompleted?: (story: PartialStoryB) => Promise<void>;
};

export interface AIProvider {
  readonly id: string;
  generateResearchBrief(input: GenerateResearchBriefInput): Promise<ResearchBrief>;
  composeAnalysis(input: ComposeAnalysisInput): Promise<AnalysisStory>;
}

export class AIServiceNotConfiguredError extends Error {
  constructor(message = "AI service is not configured") {
    super(message);
    this.name = "AIServiceNotConfiguredError";
  }
}

export class UnsupportedAIProviderError extends AIServiceNotConfiguredError {
  constructor(provider: string) {
    super(`Unsupported AI provider: ${provider}`);
    this.name = "UnsupportedAIProviderError";
  }
}
