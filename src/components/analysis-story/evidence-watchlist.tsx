import type { AnalysisStory } from "@/types/analysis";
import { isClickableSource } from "@/lib/link-integrity";

export function EvidenceSection({ evidence }: { evidence: AnalysisStory["evidence"] }) {
  return (
    <section className="story-section evidence-section">
      <div className="story-container">
        <div className="section-heading-row">
          <div><p className="story-kicker">{evidence.kicker}</p><h2>{evidence.title.map((line) => <span key={line}>{line}<br /></span>)}</h2></div>
          <span className="demo-data-label">{evidence.demoLabel}</span>
        </div>
        <p className="evidence-description">{evidence.description}</p>
        <div className="evidence-grid">
          {evidence.metrics.map((metric) => (
            <div className="evidence-card" key={metric.label}>
              <span>{metric.label}</span><strong>{metric.value}</strong><p>{metric.note}</p>
              {(metric.date || metric.source) && <small>{[metric.date, metric.source].filter(Boolean).join(" · ")}</small>}
              <i><b style={{ width: `${metric.progress ?? 0}%` }} /></i>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WatchlistSection({ watchlist }: { watchlist: AnalysisStory["watchlist"] }) {
  return (
    <section className="story-section watchlist-section" id={watchlist.id}>
      <div className="story-container">
        <p className="story-kicker">{watchlist.kicker}</p>
        <h2>{watchlist.title.map((line) => <span key={line}>{line}<br /></span>)}</h2>
        <div className="watchlist-grid">
          {watchlist.items.map((item, index) => <div key={item.name}><span>0{index + 1}</span><h3>{item.name}</h3><p>{item.reason}</p></div>)}
        </div>
      </div>
    </section>
  );
}

export function SourcesSection({ sources, label, methodology }: { sources: AnalysisStory["sources"]; label: string; methodology: string }) {
  return (
    <section className="sources-section">
      <div className="story-container">
        <div><p className="story-kicker">SOURCES &amp; METHODOLOGY</p><span className="demo-data-label">{label}</span></div>
        <div className="source-list">{sources.map((source) => {
          const clickable = isClickableSource(source);
          return <div key={`${source.name}-${source.url ?? "demo"}`}>
            <strong>{clickable ? <a href={source.url} target="_blank" rel="noreferrer">{source.title || source.name} ↗</a> : source.title || source.name}</strong>
            <p>{source.publisher ? `${source.publisher}${source.date ? ` · ${source.date}` : ""} — ` : ""}{source.description}</p>
          </div>;
        })}</div>
        <p className="methodology-note">{methodology}</p>
      </div>
    </section>
  );
}
