export type ResearchBrief = {
  question: string;
  thesis: string;
  whatHappened: string[];
  causalChain: string[];
  keyDrivers: string[];
  expectationGap: {
    marketExpected: string;
    actualOrCurrent: string;
    whyItMatters: string;
  };
  counterArguments: string[];
  assetImpacts: Array<{ asset: string; mechanism: string }>;
  watchlist: Array<{ indicator: string; why: string }>;
  sourcesUsed: string[];
  confidence: "low" | "medium" | "high";
};
