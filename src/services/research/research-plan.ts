import { z } from "zod";

export const researchPlanSchema = z.object({
  topic: z.string().min(1),
  primaryTargets: z.array(z.object({ name: z.string().min(1), domain: z.string().min(1), reason: z.string().min(1) })).max(4),
  primaryQueries: z.array(z.string().min(1)).max(3),
  contextQueries: z.array(z.string().min(1)).max(2),
});

export type ResearchPlan = z.infer<typeof researchPlanSchema>;

type PlanningRule = {
  matches: (question: string) => boolean;
  topic: string;
  primaryTargets: ResearchPlan["primaryTargets"];
  primaryQueries: string[];
  contextQueries?: string[];
};

const planningRules: PlanningRule[] = [
  {
    matches: (question) => /港(?:币|幣|元)|HKD|Hong Kong dollar|联系汇率|聯繫匯率/i.test(question),
    topic: "港元汇率与联系汇率制度",
    primaryTargets: [
      { name: "Hong Kong Monetary Authority", domain: "hkma.gov.hk", reason: "港元汇率、联系汇率及银行体系结余的原始资料" },
      { name: "Hong Kong Monetary Authority Data", domain: "hkma.gov.hk", reason: "港元兑美元汇率及货币统计数据" },
    ],
    primaryQueries: [
      `HKMA recent trend Hong Kong dollar exchange rate ${new Date().getUTCFullYear()} latest`,
      "HKMA Hong Kong dollar US dollar daily exchange rate aggregate balance",
    ],
    contextQueries: ["Hong Kong dollar HKD USD exchange rate latest Reuters market context"],
  },
  {
    matches: (question) => /美国国债|美债|Treasury/i.test(question) && /收益率|利率|科技股|黄金/i.test(question),
    topic: "美国国债收益率与跨资产定价",
    primaryTargets: [
      { name: "U.S. Department of the Treasury", domain: "treasury.gov", reason: "美国国债收益率与债务市场原始资料" },
      { name: "Federal Reserve", domain: "federalreserve.gov", reason: "利率与金融条件的原始政策资料" },
    ],
    primaryQueries: ["U.S. Treasury yields official data", "Federal Reserve interest rates financial conditions official"],
  },
  {
    matches: (question) => /美国|美联储|降息|联邦基金利率/i.test(question) && /香港|港楼|楼市|房地产/i.test(question),
    topic: "美国利率与香港房地产",
    primaryTargets: [
      { name: "Federal Reserve", domain: "federalreserve.gov", reason: "美国利率决定的原始发布机构" },
      { name: "Hong Kong Monetary Authority", domain: "hkma.gov.hk", reason: "香港利率及联系汇率制度的原始资料" },
      { name: "Hong Kong property statistics", domain: "data.gov.hk", reason: "香港房地产官方统计" },
    ],
    primaryQueries: ["Federal Reserve interest rate decision official", "HKMA base rate linked exchange rate official", "Hong Kong official property market statistics"],
  },
  {
    matches: (question) => /英伟达|NVIDIA|NVDA/i.test(question) && /业绩|财报|股价|下跌/i.test(question),
    topic: "英伟达业绩与股价反应",
    primaryTargets: [
      { name: "NVIDIA Investor Relations", domain: "investor.nvidia.com", reason: "公司财报与指引原文" },
      { name: "U.S. Securities and Exchange Commission", domain: "sec.gov", reason: "公司法定披露文件" },
    ],
    primaryQueries: ["NVIDIA investor relations earnings results guidance", "NVIDIA filings earnings SEC official"],
  },
  {
    matches: (question) => /日本|日元|日本央行|BOJ/i.test(question),
    topic: "日本货币政策与市场",
    primaryTargets: [{ name: "Bank of Japan", domain: "boj.or.jp", reason: "日本货币政策原始发布机构" }],
    primaryQueries: ["Bank of Japan monetary policy official"],
  },
  {
    matches: (question) => /欧洲央行|ECB|欧元区/i.test(question),
    topic: "欧洲央行政策与跨市场传导",
    primaryTargets: [{ name: "European Central Bank", domain: "ecb.europa.eu", reason: "欧元区货币政策原始发布机构" }],
    primaryQueries: ["European Central Bank interest rate decision official"],
  },
  {
    matches: (question) => /中国|人民币|中国央行|人民银行|PBOC/i.test(question),
    topic: "中国宏观政策与市场",
    primaryTargets: [
      { name: "People's Bank of China", domain: "pbc.gov.cn", reason: "中国货币政策原始发布机构" },
      { name: "National Bureau of Statistics of China", domain: "stats.gov.cn", reason: "中国宏观数据原始发布机构" },
    ],
    primaryQueries: ["中国人民银行 货币政策 官方", "国家统计局 宏观经济 数据 官方"],
  },
];

export function createRuleBasedResearchPlan(question: string): ResearchPlan {
  const compact = question.replace(/[？?。！!]/g, " ").replace(/\s+/g, " ").trim();
  const rule = planningRules.find((candidate) => candidate.matches(question));
  return {
    topic: rule?.topic ?? compact,
    primaryTargets: rule?.primaryTargets ?? [],
    primaryQueries: rule?.primaryQueries ?? [],
    contextQueries: rule?.contextQueries ?? [`${compact} Reuters Financial Times Bloomberg market context investor reaction`],
  };
}

export function hasSufficientRuleCoverage(plan: ResearchPlan) {
  return plan.primaryTargets.length >= 1 && plan.primaryQueries.length >= 1 && plan.contextQueries.length >= 1;
}
