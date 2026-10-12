import Link from "next/link";
import type { AnalysisStory } from "@/types/analysis";
import { isClickableStoryAction } from "@/lib/link-integrity";

function StoryAction({ action, validAnchorIds }: {
  action: AnalysisStory["mentalModel"]["primaryAction"];
  validAnchorIds: ReadonlySet<string>;
}) {
  if (!isClickableStoryAction(action.href, validAnchorIds)) return null;
  if (/^https?:\/\//i.test(action.href)) {
    return <a href={action.href} target="_blank" rel="noreferrer">{action.label}</a>;
  }
  return <Link href={action.href}>{action.label}</Link>;
}

export function MentalModel({ model, validAnchorIds }: {
  model: AnalysisStory["mentalModel"];
  validAnchorIds: ReadonlySet<string>;
}) {
  const actions = [model.primaryAction, model.secondaryAction]
    .filter((action) => isClickableStoryAction(action.href, validAnchorIds));
  return (
    <section className="story-finale">
      <div className="story-container story-narrow">
        <p className="story-kicker">{model.kicker}</p>
        <h2>{model.title}</h2>
        <p className="finale-but">{model.prefix}</p>
        <div className="finale-flow">{model.chain.map((item, index) => <div className="contents" key={item}><span>{item}</span>{index < model.chain.length - 1 ? <i>→</i> : null}</div>)}</div>
        <div className="knowledge-tags">{model.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        {actions.length > 0 ? <div className="story-actions">
          {actions.map((action) => <StoryAction action={action} validAnchorIds={validAnchorIds} key={`${action.label}-${action.href}`} />)}
        </div> : null}
      </div>
    </section>
  );
}
