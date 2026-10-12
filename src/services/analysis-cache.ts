import "server-only";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AnalysisStory } from "@/types/analysis";
import { parseAnalysisStory, toAnalysisStorySchemaValue } from "@/services/ai/analysis-schema";
import { isFreshMarketCache, MARKET_CACHE_VERSION } from "@/services/cache-policy";

const cacheDirectory = path.join(process.cwd(), "data", "generated");

function cacheKey(question: string) {
  const namespace = [process.env.SEARCH_PROVIDER, process.env.AI_RESEARCH_MODEL || process.env.AI_MODEL, process.env.AI_STORY_MODEL || process.env.AI_MODEL].join(":");
  const normalized = `${MARKET_CACHE_VERSION}:${namespace}:${question.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase()}`;
  return createHash("sha256").update(normalized).digest("hex");
}

function cachePath(question: string) {
  return path.join(cacheDirectory, `${cacheKey(question)}.json`);
}

export async function getCachedAnalysis(question: string): Promise<AnalysisStory | undefined> {
  try {
    const target = cachePath(question);
    const metadata = await stat(target);
    if (!isFreshMarketCache(metadata.mtimeMs, question)) return undefined;
    const content = await readFile(target, "utf8");
    return parseAnalysisStory(JSON.parse(content));
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
    if (code !== "ENOENT" && process.env.NODE_ENV === "development") console.error("Failed to read analysis cache", error);
    return undefined;
  }
}

export async function setCachedAnalysis(question: string, story: AnalysisStory) {
  await mkdir(cacheDirectory, { recursive: true });
  const target = cachePath(question);
  const temporary = `${target}.${process.pid}.tmp`;
  const serialized = JSON.stringify(toAnalysisStorySchemaValue(story), null, 2);
  await writeFile(temporary, serialized, "utf8");
  await rename(temporary, target);
}
