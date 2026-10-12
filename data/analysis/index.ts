import type { AnalysisStory } from "@/types/analysis";
import { fedRateCutStory } from "./fed-rate-cut";
import { goldRallyStory } from "./gold-rally";
import { aiPowerDemandStory } from "./ai-power-demand";

const stories: AnalysisStory[] = [fedRateCutStory, goldRallyStory, aiPowerDemandStory];

function normalizeTopic(topic: string) {
  return topic.replace(/[？?。！!\s]/g, "").toUpperCase();
}

const storyByTopic = new Map(stories.map((story) => [normalizeTopic(story.topic), story]));

export function getAnalysisStory(topic: string): AnalysisStory | undefined {
  return storyByTopic.get(normalizeTopic(topic));
}
