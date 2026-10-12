export type TodayMarketLabel = "FACT" | "INFERENCE" | "UNCERTAINTY";

export type TodayMarketItem = {
  id: string;
  order: number;
  category: string;
  title: string;
  summary: string;
  facts: string[];
  inference: string;
  uncertainty: string;
  variables: Array<{ name: string; mechanism: string }>;
  watch: Array<{ indicator: string; signal: string }>;
  analysisHref: string;
};

export type TodayMarketSnapshot = {
  version: "0.1";
  date: string;
  timezone: "Asia/Shanghai";
  updatedAt: string;
  freshnessLabel: string;
  title: string;
  lead: string;
  methodology: string;
  items: TodayMarketItem[];
};
