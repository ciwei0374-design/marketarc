import type { FlowItem } from "@/types/analysis";

export function FlowDiagram({ items }: { items: FlowItem[] }) {
  return (
    <div className="story-flow" aria-label={items.map((item) => item.title).join("，然后")}>
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className="story-flow-step">
          <span><strong>{item.title}</strong>{item.note ? <small>{item.note}</small> : null}</span>
          {index < items.length - 1 ? <i aria-hidden="true">→</i> : null}
        </div>
      ))}
    </div>
  );
}
