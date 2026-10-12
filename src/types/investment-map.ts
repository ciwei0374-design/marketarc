export type AssetEffect = {
  assetClass: string;
  tendency: "可能承压" | "可能受益" | "影响分化";
  explanation: string;
};

export type InvestmentMapPath = {
  id: string;
  event: string;
  eventQuestion: string;
  plainLanguage: string;
  mechanismName: string;
  mechanismSteps: string[];
  assetEffects: AssetEffect[];
  counterconditions: Array<{ condition: string; consequence: string }>;
  watchSignals: Array<{ indicator: string; rising: string; falling: string }>;
};

export type InvestmentMapData = {
  version: "0.1";
  title: string;
  lead: string;
  methodology: string;
  paths: InvestmentMapPath[];
};
