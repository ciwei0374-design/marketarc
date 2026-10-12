import type { AnalysisStory } from "@/types/analysis";
import { FlowDiagram } from "./flow-diagram";

type AssetSection = AnalysisStory["assetSections"][number];

function StockVisual({ section }: { section: AssetSection }) {
  return (
    <>
      <div className="story-two-column">
        <div>
          <p className="story-kicker">{section.kicker}</p>
          <h2>{section.title.map((line) => <span key={line}>{line}<br /></span>)}</h2>
          {section.intro ? <p className="story-intro">{section.intro}</p> : null}
        </div>
        <div className="future-value-visual">
          <span className="future-time">{section.visualLabel}</span>
          <strong>{section.visualValue}</strong>
          <div className="future-line" />
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
      <div className="rate-compare">
        {section.comparisons?.map((item) => <div key={`${item.label}-${item.value}`}><span>{item.label}</span>{item.value ? <b>{item.value}</b> : null}<strong>{item.lines.join(" ")}</strong></div>)}
      </div>
      {section.flow ? <FlowDiagram items={section.flow} /> : null}
    </>
  );
}

function GoldVisual({ section }: { section: AssetSection }) {
  return (
    <>
      <p className="story-kicker">{section.kicker}</p>
      <h2>{section.title.map((line) => <span key={line}>{line}<br /></span>)}</h2>
      <div className="story-prose">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
      <div className="gold-zero"><span>{section.visualLabel}</span><strong>{section.visualValue}</strong><small>{section.visualUnit}</small></div>
      <div className="gold-balance">
        {section.comparisons?.map((item, index) => (
          <div className="contents" key={item.label}>
            <div><span>{item.label}</span>{item.lines.map((line) => <p key={line}>{line}</p>)}</div>
            {index === 0 ? <i aria-hidden="true" /> : null}
          </div>
        ))}
      </div>
      {section.note ? <p className="story-note">{section.note}</p> : null}
    </>
  );
}

export function AssetExplanation({ section }: { section: AssetSection }) {
  const isGold = section.asset === "gold";
  return (
    <section className={`story-section ${isGold ? "story-section-tinted" : ""}`} id={section.id}>
      <div className={`story-container ${isGold ? "story-narrow" : ""}`}>
        {isGold ? <GoldVisual section={section} /> : <StockVisual section={section} />}
      </div>
    </section>
  );
}
