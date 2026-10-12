import type { StoryCopy } from "@/types/analysis";

export function StoryCopyLines({ copy }: { copy: StoryCopy }) {
  return copy.lines.map((line, index) => {
    const isEmphasis = line === copy.emphasis;
    return (
      <span key={`${line}-${index}`} className={isEmphasis ? "story-copy-emphasis" : undefined}>
        {line}
        {index < copy.lines.length - 1 ? <br /> : null}
      </span>
    );
  });
}

export function EmphasizedParagraph({ text, emphasis }: { text: string; emphasis?: string }) {
  if (!emphasis || !text.includes(emphasis)) return text;
  const [before, after] = text.split(emphasis);
  return <>{before}<strong>{emphasis}</strong>{after}</>;
}
