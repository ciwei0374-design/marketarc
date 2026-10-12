import type { AnalysisStory } from "@/types/analysis";

export const goldRallyStory = {
  slug: "gold-rally",
  topic: "黄金为什么持续上涨？",
  category: "宏观资产",
  eyebrow: "MARKETARC · ASSET EXPLAINED",
  title: { lines: ["黄金不生利息，", "为什么人们还愿意越来越贵地买它？"], emphasis: "为什么人们还愿意越来越贵地买它？" },
  subtitle: { lines: ["它不会自己创造利润。", "但它是一只不依赖任何一家公司的全球保险箱。"], emphasis: "但它是一只不依赖任何一家公司的全球保险箱。" },
  disclaimer: "投资教育演示 · 不构成投资建议",
  hook: "黄金不是单纯交易通胀，它同时映射实际利率、美元、央行储备选择与人们对信用体系的信任。",
  analogy: {
    id: "global-vault",
    kicker: "先理解黄金是什么",
    title: ["一只没有利息的", "全球保险箱。"],
    paragraphs: ["黄金不会支付利息，也不依赖某家公司的经营结果。它的特殊之处，是不以任何一家企业、银行或单一政府的偿付承诺为前提。", "这并不意味着黄金永远安全，而是当人们重新评估信用风险时，这只保险箱的相对吸引力可能改变。"],
    emphasis: "不以任何一家企业、银行或单一政府的偿付承诺为前提",
    bullets: ["不生利息", "无单一发行主体", "全球流动性", "储备多元化"],
    flow: [
      { title: "实际利率", note: "持有黄金的机会成本" },
      { title: "美元", note: "全球购买成本与定价" },
      { title: "央行购金", note: "长期储备配置需求" },
      { title: "避险 / 信任", note: "对信用体系的担忧" },
      { title: "黄金定价", note: "四股力量共同作用" },
    ],
    conclusion: { lines: ["黄金价格背后，", "至少有四股力量。"], emphasis: "至少有四股力量。" },
    visual: { visualType: "brake-meter", ariaLabel: "黄金四因素定价压力仪表盘", label: "GOLD DRIVERS", scaleStart: "YIELD", scaleEnd: "RISK", value: "4", valueLabel: "FORCES", footerLabel: "PRICING", footerValue: "MULTI-FACTOR" },
  },
  background: {
    kicker: "第一股力量 · REAL YIELD",
    title: ["为什么实际利率", "如此重要？"],
    paragraphs: ["如果存款和债券能够提供很高的实际收益，持有不生息黄金的机会成本就会很高。反过来，实际利率下降时，黄金的相对吸引力可能提高。"],
    flow: [
      { title: "实际利率下降", note: "扣除通胀后的回报走低" },
      { title: "债券实际回报下降", note: "安全收益不再那么诱人" },
      { title: "黄金机会成本下降", note: "不生息的劣势缩小" },
      { title: "配置需求变化", note: "资金重新比较资产" },
      { title: "相对吸引力提高", note: "不等于价格必然上涨" },
    ],
  },
  keyInsight: {
    kicker: "全篇最重要的认知",
    title: "黄金创新高，不代表“世界末日要来了”。",
    body: { lines: ["真正需要问的是：", "现在推动黄金的，", "到底是哪一股力量？"], emphasis: "到底是哪一股力量？" },
  },
  assetSections: [
    {
      id: "usd-and-gold", asset: "usd", kicker: "第二股力量 · USD", title: ["黄金以美元计价，", "但美元不是机械开关。"], intro: "美元走弱时，非美元投资者购买黄金的成本可能下降。", paragraphs: ["美元与黄金经常呈现反向关系，但两者也可能在避险需求很强时同时上涨。关键不是背口诀，而是理解当时资金为什么移动。"], visualType: "comparison", visualLabel: "GLOBAL PRICING", visualValue: "USD",
      comparisons: [
        { label: "美元走弱", value: "↓", lines: ["非美元买家的购买成本可能下降"] },
        { label: "强避险阶段", value: "?", lines: ["美元与黄金也可能同时获得需求"] },
      ],
      flow: [{ title: "美元变化" }, { title: "全球购买成本变化" }, { title: "黄金需求重新定价" }],
    },
    {
      id: "central-bank-demand", asset: "central-banks", kicker: "第三股力量 · CENTRAL BANKS", title: ["央行买黄金，", "不是为了短线赚钱。"], intro: "央行考虑的是整个储备体系的安全性与多元化。", paragraphs: ["黄金没有单一发行主体的信用风险，具有全球流动性，也能降低储备过度依赖某一种货币或债券的程度。"], visualType: "comparison", visualLabel: "RESERVE OBJECTIVE", visualValue: "DIVERSIFY",
      comparisons: [
        { label: "信用结构", value: "NONE", lines: ["无单一发行主体信用风险"] },
        { label: "储备功能", value: "GLOBAL", lines: ["全球流动性与配置多元化"] },
      ],
      flow: [{ title: "储备集中" }, { title: "多元化需求上升" }, { title: "央行黄金配置增加" }],
    },
    {
      id: "trust-and-risk", asset: "gold", kicker: "第四股力量 · RISK & TRUST", title: ["所谓“避险”，", "本质上是在担心什么？"], paragraphs: ["当投资者开始担心货币、银行、政府信用、战争或资本管制时，会重新评估资产是否依赖某个发行主体。", "黄金并不能消除风险，但它作为不依赖某个发行主体的资产，需求可能因此改变。"], visualType: "asset", visualLabel: "GOLD PAYS", visualValue: "0%", visualUnit: "INTEREST",
      comparisons: [
        { label: "体系稳定", lines: ["信用资产更有吸引力", "保险需求较低"] },
        { label: "信任受压", lines: ["发行主体风险被重估", "保险需求可能上升"] },
      ],
      note: "不同阶段，黄金上涨背后的主驱动力可能完全不同。不要把所有上涨都归因于同一种“避险”。",
    },
  ],
  evidence: {
    kicker: "EVIDENCE · 四因素面板", title: ["先识别驱动力，", "再解释价格。"], demoLabel: "DEMO DATA", description: "以下仅为概念性状态面板，用于演示未来真实数据的呈现方式，不代表当前市场状态。",
    metrics: [
      { label: "REAL YIELD · 实际利率", value: "下降", note: "机会成本方向示意", progress: 40 },
      { label: "USD · 美元", value: "走弱", note: "全球定价方向示意", progress: 46 },
      { label: "CENTRAL BANKS · 央行", value: "增持", note: "储备需求方向示意", progress: 72 },
      { label: "RISK · 信任需求", value: "上升", note: "避险需求方向示意", progress: 66 },
    ],
  },
  expectationGap: {
    id: "expectations", kicker: "方向正确，还不够", title: { lines: ["市场交易的不是“会不会降息”，", "而是变化有没有超出预期。"], emphasis: "而是变化有没有超出预期。" }, englishStatement: ["RIGHT DIRECTION", "WRONG SURPRISE."], statement: { lines: ["价格交易的是", "预期差。"], emphasis: "预期差。" },
    cases: [
      { label: "CASE A · 已经提前交易", tone: "neutral", expected: "降息", actual: "如期降息", surprise: "0", result: "方向正确，但没有新信息" },
      { label: "CASE B · 变化超过预期", tone: "highlight", expected: "缓慢下降", actual: "更快下降", surprise: "FASTER", questions: ["实际利率降得更快？", "还是——", "风险需求突然上升？"] },
    ],
    insight: { lines: ["即使方向判断正确，", "如果市场早已提前交易，", "黄金也不一定继续上涨。"], emphasis: "黄金也不一定继续上涨。" },
  },
  watchlist: {
    id: "what-to-watch", kicker: "WHAT TO WATCH · 接下来观察什么", title: ["不要只盯金价，", "去看背后的驱动力。"],
    items: [
      { name: "美国实际利率", reason: "它直接影响持有不生息黄金的机会成本。" },
      { name: "10Y 美债收益率", reason: "结合通胀预期，可以帮助理解实际回报的变化。" },
      { name: "美元指数", reason: "它影响非美元投资者的购买成本与全球资金方向。" },
      { name: "央行黄金储备", reason: "储备变化能观察长期官方配置需求。" },
      { name: "ETF 黄金持仓", reason: "它反映部分金融投资者的配置与赎回行为。" },
      { name: "通胀预期", reason: "它与名义收益率共同决定实际利率环境。" },
    ],
  },
  reviewFramework: {
    kicker: "把多因素框架带走", title: ["黄金上涨时，", "先问这四股力量谁在主导。"], questions: ["实际利率怎么走？", "美元发生了什么？", "央行是否持续购金？", "信任与避险需求是否改变？"],
  },
  mentalModel: {
    kicker: "TODAY'S MENTAL MODEL", title: "黄金价格，不是一个变量决定的。", prefix: "四股力量共同进入", chain: ["实际利率", "美元", "央行需求", "风险偏好", "黄金定价"], tags: ["实际利率", "美元", "避险资产", "央行储备", "预期差"],
    primaryAction: { label: "我懂了，继续探索", href: "/#question" }, secondaryAction: { label: "再看一个案例", href: "/analysis?q=AI为什么会带动电力需求？" },
  },
  sources: [
    { name: "Federal Reserve", description: "利率与金融条件来源结构占位。" },
    { name: "U.S. Treasury", description: "名义收益率与实际收益率来源结构占位。" },
    { name: "Official reserve statistics", description: "央行黄金储备与储备结构来源占位。" },
  ],
  sourceLabel: "Demo source structure",
  methodology: "本案例使用概念性 Mock 状态，不是实时行情或投资信号。未来应展示数据日期、统计口径与原始来源。",
} satisfies AnalysisStory;
