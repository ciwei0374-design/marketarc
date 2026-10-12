export type AnalysisVisualType =
  | "brake-meter"
  | "flow"
  | "comparison"
  | "chart"
  | "timeline"
  | "asset"
  | "none";

export type FlowItem = {
  title: string;
  note?: string;
};

export type StoryCopy = {
  lines: string[];
  emphasis?: string;
};

export type StoryMetric = {
  label: string;
  value: string;
  note?: string;
  date?: string;
  source?: string;
  progress?: number;
};

export type StoryVisual = {
  visualType: AnalysisVisualType;
  ariaLabel?: string;
  label?: string;
  scaleStart?: string;
  scaleEnd?: string;
  value?: string;
  valueLabel?: string;
  footerLabel?: string;
  footerValue?: string;
};

export type AnalysisStory = {
  slug: string;
  topic: string;
  category: string;
  eyebrow: string;
  title: StoryCopy;
  subtitle: StoryCopy;
  disclaimer: string;
  hook: string;
  analogy: {
    id: string;
    kicker: string;
    title: string[];
    paragraphs: string[];
    emphasis: string;
    bullets: string[];
    flow: FlowItem[];
    conclusion: StoryCopy;
    visual: StoryVisual;
  };
  background: {
    kicker: string;
    title: string[];
    paragraphs: string[];
    flow: FlowItem[];
  };
  keyInsight: {
    kicker: string;
    title: string;
    body: StoryCopy;
  };
  assetSections: Array<{
    id: string;
    asset: string;
    kicker: string;
    title: string[];
    intro?: string;
    paragraphs: string[];
    visualType: AnalysisVisualType;
    visualLabel?: string;
    visualValue?: string;
    visualUnit?: string;
    metrics?: StoryMetric[];
    comparisons?: Array<{
      label: string;
      value?: string;
      lines: string[];
    }>;
    flow?: FlowItem[];
    note?: string;
  }>;
  evidence: {
    kicker: string;
    title: string[];
    demoLabel: string;
    description: string;
    metrics: StoryMetric[];
  };
  expectationGap: {
    id: string;
    kicker: string;
    title: StoryCopy;
    englishStatement: string[];
    statement: StoryCopy;
    cases: Array<{
      label: string;
      tone: "neutral" | "highlight";
      expected: string;
      actual: string;
      surprise: string;
      result?: string;
      questions?: string[];
    }>;
    insight: StoryCopy;
  };
  watchlist: {
    id: string;
    kicker: string;
    title: string[];
    items: Array<{
      name: string;
      reason: string;
    }>;
  };
  reviewFramework: {
    kicker: string;
    title: string[];
    questions: string[];
  };
  mentalModel: {
    kicker: string;
    title: string;
    prefix: string;
    chain: string[];
    tags: string[];
    primaryAction: { label: string; href: string };
    secondaryAction: { label: string; href: string };
  };
  sources: Array<{
    name: string;
    description: string;
    title?: string;
    publisher?: string;
    url?: string;
    date?: string;
  }>;
  sourceLabel: string;
  methodology: string;
};
