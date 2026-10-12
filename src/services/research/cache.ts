import "server-only";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import type { ResearchContext } from "./types";
import { isFreshMarketCache, MARKET_CACHE_VERSION } from "@/services/cache-policy";

const cacheDirectory = path.join(process.cwd(), "data", "research");
const sourceSchema = z.object({
  id: z.string(), title: z.string(), publisher: z.string(), url: z.string().url(), publishedAt: z.string().nullable(), snippet: z.string(),
  sourceType: z.enum(["official", "company", "statistics", "news", "research", "other"]),
  sourceTier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]), isPrimary: z.boolean(),
});
const contextSchema = z.object({
  provider: z.string(), query: z.string(), queries: z.array(z.string()), searched: z.boolean(), searchedAt: z.string().nullable(),
  status: z.enum(["not-performed", "completed", "unavailable"]), usageCredits: z.number().nullable(),
  primarySourceCoverage: z.enum(["not-applicable", "low", "medium", "high"]), sources: z.array(sourceSchema),
  facts: z.array(z.object({ statement: z.string(), sourceIds: z.array(z.string()) })),
});

function cachePath(question: string, provider: string) {
  const normalized = `${MARKET_CACHE_VERSION}:${provider}:${question.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase()}`;
  return path.join(cacheDirectory, `${createHash("sha256").update(normalized).digest("hex")}.json`);
}

export function getResearchCacheReference(question: string, provider: string) {
  return path.relative(process.cwd(), cachePath(question, provider)).replaceAll("\\", "/");
}

export async function getCachedResearch(question: string, provider: string): Promise<ResearchContext | undefined> {
  try {
    const cached = contextSchema.parse(JSON.parse(await readFile(cachePath(question, provider), "utf8")));
    return isFreshMarketCache(cached.searchedAt, question) ? cached : undefined;
  } catch {
    return undefined;
  }
}

export async function setCachedResearch(question: string, research: ResearchContext) {
  if (!research.searched) return;
  await mkdir(cacheDirectory, { recursive: true });
  const target = cachePath(question, research.provider);
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(contextSchema.parse(research), null, 2), "utf8");
  await rename(temporary, target);
}
