import type { AnalysisStory } from "@/types/analysis";
import { FlowDiagram } from "./flow-diagram";
import { EmphasizedParagraph, StoryCopyLines } from "./story-copy";

export function AnalogySection({ analogy }: { analogy: AnalysisStory["analogy"] }) {
  return (
    <section className="story-section" id={analogy.id}>
      <div className="story-container story-narrow">
        <p className="story-kicker">{analogy.kicker}</p>
        <h2>{analogy.title.map((line) => <span key={line}>{line}<br /></span>)}</h2>
        <div className="story-prose">
          {analogy.paragraphs.map((paragraph) => <p key={paragraph}><EmphasizedParagraph text={paragraph} emphasis={analogy.emphasis} /></p>)}
        </div>
        <div className="brake-list">{analogy.bullets.map((item) => <span key={item}>{item}</span>)}</div>
        <FlowDiagram items={analogy.flow} />
        <blockquote><StoryCopyLines copy={analogy.conclusion} /></blockquote>
      </div>
    </section>
  );
}

export function BackgroundSection({ background }: { background: AnalysisStory["background"] }) {
  return (
    <section className="story-section story-section-tinted">
      <div className="story-container story-narrow">
        <p className="story-kicker">{background.kicker}</p>
        <h2>{background.title.map((line) => <span key={line}>{line}<br /></span>)}</h2>
        {background.paragraphs.map((paragraph) => <p className="story-intro" key={paragraph}>{paragraph}</p>)}
        <FlowDiagram items={background.flow} />
      </div>
    </section>
  );
}
