import "server-only";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ResearchBrief } from "@/types/research-brief";
import type { ResearchContext } from "@/services/research";
import { parseResearchBrief } from "./research-brief-schema";

const cacheDirectory = path.join(process.cwd(), "data", "briefs");

function cachePath(question: string, research: ResearchContext, model: string) {
  const identity = `${model}:${research.provider}:${research.searchedAt ?? "none"}:${question.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase()}`;
  return path.join(cacheDirectory, `${createHash("sha256").update(identity).digest("hex")}.json`);
}

export async function getCachedResearchBrief(question: string, research: ResearchContext, model: string): Promise<ResearchBrief | undefined> {
  try {
    return parseResearchBrief(JSON.parse(await readFile(cachePath(question, research, model), "utf8")));
  } catch {
    return undefined;
  }
}

export async function setCachedResearchBrief(question: string, research: ResearchContext, model: string, brief: ResearchBrief) {
  await mkdir(cacheDirectory, { recursive: true });
  const target = cachePath(question, research, model);
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(parseResearchBrief(brief), null, 2), "utf8");
  await rename(temporary, target);
}
