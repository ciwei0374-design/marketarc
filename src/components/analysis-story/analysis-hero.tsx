import Link from "next/link";
import type { AnalysisStory } from "@/types/analysis";
import { StoryCopyLines } from "./story-copy";

function BrakeMeter({ visual }: { visual: AnalysisStory["analogy"]["visual"] }) {
  if (visual.visualType !== "brake-meter") return null;
  return (
    <div className="brake-visual" aria-label={visual.ariaLabel} role="img">
      <div className="gauge-label">{visual.label}</div>
      <div className="gauge-scale"><span>{visual.scaleStart}</span><i /><span>{visual.scaleEnd}</span></div>
      <div className="brake-wheel"><div className="brake-wheel-core"><span>{visual.value}</span><small>{visual.valueLabel}</small></div><i className="gauge-needle" /></div>
      <div className="brake-meter"><span>{visual.footerLabel}</span><strong>{visual.footerValue}</strong><i /></div>
    </div>
  );
}

export function AnalysisHero({ story }: { story: Pick<AnalysisStory, "eyebrow" | "title" | "subtitle" | "disclaimer" | "analogy"> }) {
  return (
    <section className="story-hero">
      <div className="story-container story-hero-grid">
        <div>
          <Link href="/" className="story-back">← 返回首页</Link>
          <p className="eyebrow mt-14">{story.eyebrow}</p>
          <h1><StoryCopyLines copy={story.title} /></h1>
          <p className="story-lead"><StoryCopyLines copy={story.subtitle} /></p>
          <p className="story-disclaimer">{story.disclaimer}</p>
        </div>
        <BrakeMeter visual={story.analogy.visual} />
      </div>
    </section>
  );
}
