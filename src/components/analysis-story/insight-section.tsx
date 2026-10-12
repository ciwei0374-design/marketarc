import type { AnalysisStory } from "@/types/analysis";
export function InsightSection({ insight }: { insight: AnalysisStory["keyInsight"] }) {
  return (
    <section className="insight-section">
      <div className="story-container story-narrow">
        <p className="insight-kicker">{insight.kicker}</p>
        <h2>{insight.title}</h2>
        <div className="insight-body">
          {insight.body.lines.map((line, index) => <p key={`${index}-${line}`}>{line}</p>)}
        </div>
      </div>
    </section>
  );
}
