import type { ResearchPlan } from "./research-plan";
import { createRuleBasedResearchPlan, hasSufficientRuleCoverage } from "./research-plan";
import { getAIResearchPlanner, getAIStageModels } from "@/services/ai/provider";

export type PlannedResearch = { plan: ResearchPlan; source: "rule" | "ai" | "rule-fallback"; durationMs: number };

export async function planResearch(question: string): Promise<PlannedResearch> {
  const startedAt = performance.now();
  const rulePlan = createRuleBasedResearchPlan(question);
  if (hasSufficientRuleCoverage(rulePlan)) {
    return { plan: rulePlan, source: "rule", durationMs: Math.round(performance.now() - startedAt) };
  }
  try {
    const planner = getAIResearchPlanner();
    const { researchModel } = getAIStageModels();
    const plan = await planner.generateResearchPlan(question, researchModel);
    return { plan, source: "ai", durationMs: Math.round(performance.now() - startedAt) };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.log("[research-planner] fallback", { type: error instanceof Error ? error.name : typeof error, message: error instanceof Error ? error.message : String(error) });
    }
    return { plan: rulePlan, source: "rule-fallback", durationMs: Math.round(performance.now() - startedAt) };
  }
}
