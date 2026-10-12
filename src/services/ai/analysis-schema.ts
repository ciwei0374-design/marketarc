import { z } from "zod";
import type { AnalysisStory } from "@/types/analysis";

const nullableString = z.string().nullable();
const visualType = z.enum(["brake-meter", "flow", "comparison", "chart", "timeline", "asset", "none"]);
const flowItem = z.object({ title: z.string(), note: nullableString });
const storyCopy = z.object({ lines: z.array(z.string()).min(1), emphasis: nullableString });
const metric = z.object({
  label: z.string(),
  value: z.string(),
  note: nullableString,
  date: nullableString,
  source: nullableString,
  progress: z.number().min(0).max(100).nullable(),
});
const visual = z.object({
  visualType,
  ariaLabel: nullableString,
  label: nullableString,
  scaleStart: nullableString,
  scaleEnd: nullableString,
  value: nullableString,
  valueLabel: nullableString,
  footerLabel: nullableString,
  footerValue: nullableString,
});

export const analysisStorySchema = z.object({
  slug: z.string(),
  topic: z.string(),
  category: z.string(),
  eyebrow: z.string(),
  title: storyCopy,
  subtitle: storyCopy,
  disclaimer: z.string(),
  hook: z.string(),
  analogy: z.object({
    id: z.string(), kicker: z.string(), title: z.array(z.string()).min(1), paragraphs: z.array(z.string()).min(1), emphasis: z.string(), bullets: z.array(z.string()), flow: z.array(flowItem).min(3), conclusion: storyCopy, visual,
  }),
  background: z.object({ kicker: z.string(), title: z.array(z.string()).min(1), paragraphs: z.array(z.string()).min(1), flow: z.array(flowItem).min(3) }),
  keyInsight: z.object({ kicker: z.string(), title: z.string(), body: storyCopy }),
  assetSections: z.array(z.object({
    id: z.string(), asset: z.string(), kicker: z.string(), title: z.array(z.string()).min(1), intro: nullableString, paragraphs: z.array(z.string()).min(1), visualType, visualLabel: nullableString, visualValue: nullableString, visualUnit: nullableString, metrics: z.array(metric).nullable(),
    comparisons: z.array(z.object({ label: z.string(), value: nullableString, lines: z.array(z.string()).min(1) })).nullable(),
    flow: z.array(flowItem).nullable(), note: nullableString,
  })).min(2),
  evidence: z.object({ kicker: z.string(), title: z.array(z.string()).min(1), demoLabel: z.string(), description: z.string(), metrics: z.array(metric).min(3).max(5) }),
  expectationGap: z.object({
    id: z.string(), kicker: z.string(), title: storyCopy, englishStatement: z.array(z.string()).min(1), statement: storyCopy,
    cases: z.array(z.object({ label: z.string(), tone: z.enum(["neutral", "highlight"]), expected: z.string(), actual: z.string(), surprise: z.string(), result: nullableString, questions: z.array(z.string()).nullable() })).min(2).max(2),
    insight: storyCopy,
  }),
  watchlist: z.object({ id: z.string(), kicker: z.string(), title: z.array(z.string()).min(1), items: z.array(z.object({ name: z.string(), reason: z.string() })).min(4).max(7) }),
  reviewFramework: z.object({ kicker: z.string(), title: z.array(z.string()).min(1), questions: z.array(z.string()).min(4).max(4) }),
  mentalModel: z.object({
    kicker: z.string(), title: z.string(), prefix: z.string(), chain: z.array(z.string()).min(3).max(6), tags: z.array(z.string()).min(3).max(7),
    primaryAction: z.object({ label: z.string(), href: z.string() }), secondaryAction: z.object({ label: z.string(), href: z.string() }),
  }),
  sources: z.array(z.object({ name: z.string(), description: z.string(), title: z.string(), publisher: z.string(), url: z.string(), date: z.string() })).min(1).max(10),
  sourceLabel: z.string(),
  methodology: z.string(),
});

export const analysisStoryJsonSchema = z.toJSONSchema(analysisStorySchema);

function removeNulls(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removeNulls);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== null).map(([key, item]) => [key, removeNulls(item)]));
  }
  return value;
}

export function parseAnalysisStory(value: unknown): AnalysisStory {
  return removeNulls(analysisStorySchema.parse(value)) as AnalysisStory;
}

export function toAnalysisStorySchemaValue(story: AnalysisStory) {
  return analysisStorySchema.parse({
    ...story,
    title: { ...story.title, emphasis: story.title.emphasis ?? null },
    subtitle: { ...story.subtitle, emphasis: story.subtitle.emphasis ?? null },
    analogy: {
      ...story.analogy,
      flow: story.analogy.flow.map((item) => ({ ...item, note: item.note ?? null })),
      conclusion: { ...story.analogy.conclusion, emphasis: story.analogy.conclusion.emphasis ?? null },
      visual: {
        ...story.analogy.visual,
        ariaLabel: story.analogy.visual.ariaLabel ?? null, label: story.analogy.visual.label ?? null, scaleStart: story.analogy.visual.scaleStart ?? null,
        scaleEnd: story.analogy.visual.scaleEnd ?? null, value: story.analogy.visual.value ?? null, valueLabel: story.analogy.visual.valueLabel ?? null,
        footerLabel: story.analogy.visual.footerLabel ?? null, footerValue: story.analogy.visual.footerValue ?? null,
      },
    },
    background: { ...story.background, flow: story.background.flow.map((item) => ({ ...item, note: item.note ?? null })) },
    keyInsight: { ...story.keyInsight, body: { ...story.keyInsight.body, emphasis: story.keyInsight.body.emphasis ?? null } },
    assetSections: story.assetSections.map((section) => ({
      ...section,
      intro: section.intro ?? null, visualLabel: section.visualLabel ?? null, visualValue: section.visualValue ?? null, visualUnit: section.visualUnit ?? null,
      metrics: section.metrics?.map((item) => ({ ...item, note: item.note ?? null, date: item.date ?? null, source: item.source ?? null, progress: item.progress ?? null })) ?? null,
      comparisons: section.comparisons?.map((item) => ({ ...item, value: item.value ?? null })) ?? null,
      flow: section.flow?.map((item) => ({ ...item, note: item.note ?? null })) ?? null,
      note: section.note ?? null,
    })),
    evidence: { ...story.evidence, metrics: story.evidence.metrics.map((item) => ({ ...item, note: item.note ?? null, date: item.date ?? null, source: item.source ?? null, progress: item.progress ?? null })) },
    expectationGap: {
      ...story.expectationGap,
      title: { ...story.expectationGap.title, emphasis: story.expectationGap.title.emphasis ?? null },
      statement: { ...story.expectationGap.statement, emphasis: story.expectationGap.statement.emphasis ?? null },
      cases: story.expectationGap.cases.map((item) => ({ ...item, result: item.result ?? null, questions: item.questions ?? null })),
      insight: { ...story.expectationGap.insight, emphasis: story.expectationGap.insight.emphasis ?? null },
    },
    sources: story.sources.map((source) => ({
      ...source, title: source.title ?? source.name, publisher: source.publisher ?? source.name, url: source.url ?? "", date: source.date ?? "",
    })),
  });
}
