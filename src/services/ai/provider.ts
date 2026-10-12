import "server-only";
import type { AIProvider } from "./types";
import { AIServiceNotConfiguredError, UnsupportedAIProviderError } from "./types";
import { OpenAICompatibleProvider } from "./providers/openai-compatible";

type AIConfig = {
  provider: string;
  baseURL: string;
  apiKey: string;
  model: string;
};

function getAIConfig(): AIConfig {
  const provider = process.env.AI_PROVIDER?.trim() || "openai-compatible";
  const baseURL = process.env.AI_BASE_URL?.trim() || "";
  const apiKey = process.env.AI_API_KEY?.trim() || "";
  const model = process.env.AI_MODEL?.trim() || "";

  if (!baseURL || !apiKey || !model) {
    throw new AIServiceNotConfiguredError("AI_BASE_URL, AI_API_KEY and AI_MODEL must all be configured");
  }
  return { provider, baseURL, apiKey, model };
}

export function getAIProvider(): AIProvider {
  const config = getAIConfig();
  switch (config.provider) {
    case "openai-compatible":
      return new OpenAICompatibleProvider(config);
    default:
      throw new UnsupportedAIProviderError(config.provider);
  }
}

export function getAIResearchPlanner() {
  const config = getAIConfig();
  switch (config.provider) {
    case "openai-compatible":
      return new OpenAICompatibleProvider(config);
    default:
      throw new UnsupportedAIProviderError(config.provider);
  }
}

export function getAIStageModels() {
  const defaultModel = process.env.AI_MODEL?.trim();
  if (!defaultModel) throw new AIServiceNotConfiguredError("AI_MODEL must be configured");
  return {
    researchModel: process.env.AI_RESEARCH_MODEL?.trim() || defaultModel,
    storyModel: process.env.AI_STORY_MODEL?.trim() || defaultModel,
  };
}
