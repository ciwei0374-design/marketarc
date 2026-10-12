import type { AnalysisStory } from "@/types/analysis";
import { StoryCopyLines } from "./story-copy";

export function ExpectationGap({ section }: { section: AnalysisStory["expectationGap"] }) {
  return (
    <section className="expectation-section" id={section.id}>
      <div className="story-container">
        <p className="story-kicker">{section.kicker}</p>
        <h2><StoryCopyLines copy={section.title} /></h2>
        <p className="expectation-english" lang="en">{section.englishStatement.map((line) => <span key={line}>{line}</span>)}</p>
        <p className="expectation-statement"><StoryCopyLines copy={section.statement} /></p>
        <div className="scenario-grid">
          {section.cases.map((scenario) => (
            <div className={`scenario-card ${scenario.tone === "highlight" ? "scenario-card-active" : ""}`} key={scenario.label}>
              <div className="scenario-label">{scenario.label}</div>
              <dl><div><dt>市场预期</dt><dd>{scenario.expected}</dd></div><div><dt>实际</dt><dd>{scenario.actual}</dd></div></dl>
              <div className="surprise"><span>SURPRISE</span><strong>{scenario.surprise}</strong>{scenario.result ? <small>{scenario.result}</small> : null}</div>
              {scenario.questions ? <div className="scenario-question">{scenario.questions.map((question, index) => index === 1 ? <span key={question}>{question}</span> : <p key={question}>{question}</p>)}</div> : null}
            </div>
          ))}
        </div>
        <blockquote className="expectation-quote">
          {section.insight.lines.map((line, index) => <span key={`${index}-${line}`} className={line === section.insight.emphasis ? "story-copy-emphasis" : undefined}>{line}</span>)}
        </blockquote>
      </div>
    </section>
  );
}
