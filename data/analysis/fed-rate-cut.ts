import type { AnalysisStory } from "@/types/analysis";

export const fedRateCutStory = {
  slug: "fed-rate-cut",
  topic: "美联储为什么降息？",
  category: "货币政策",
  eyebrow: "MARKETARC · ECONOMY EXPLAINED",
  title: { lines: ["美联储降息，", "真的是因为经济变好了吗？"], emphasis: "真的是因为经济变好了吗？" },
  subtitle: { lines: ["很多人看到“降息”的第一反应是“利好来了”。", "但你可能把因果关系看反了。"], emphasis: "但你可能把因果关系看反了。" },
  disclaimer: "投资教育演示 · 不构成投资建议",
  hook: "降息不是庆功信号，而是央行在增长、就业与通胀之间重新权衡风险。",
  analogy: {
    id: "economy-brake",
    kicker: "先从一个比喻开始",
    title: ["先把美国经济", "想象成一辆车。"],
    paragraphs: ["通胀太高的时候，美联储做的事情有点像踩刹车。", "它通过加息，让房贷、企业融资和日常借款都变贵。钱更难借，消费和投资自然会慢下来。"],
    emphasis: "踩刹车",
    bullets: ["借钱更贵", "房贷更贵", "企业融资更贵", "消费和投资降温"],
    flow: [
      { title: "加息", note: "政策利率上调" },
      { title: "借钱变贵", note: "资金成本上升" },
      { title: "消费 / 投资降温", note: "需求开始放缓" },
      { title: "经济降温", note: "增长速度下降" },
      { title: "通胀压力下降", note: "价格压力缓和" },
    ],
    conclusion: { lines: ["加息，本质上是在主动让经济", "“冷下来”。"], emphasis: "“冷下来”。" },
    visual: { visualType: "brake-meter", ariaLabel: "经济刹车压力仪表盘", label: "ECONOMY", scaleStart: "HOT", scaleEnd: "COLD", value: "72", valueLabel: "PRESSURE", footerLabel: "BRAKE", footerValue: "INTEREST RATE ↑" },
  },
  background: {
    kicker: "刹车不能永远踩到底",
    title: ["那为什么现在", "又要松开刹车？"],
    paragraphs: ["因为控制通胀有代价。高利率持续得越久，经济承受的压力就越大。"],
    flow: [
      { title: "高利率持续", note: "紧缩维持更久" },
      { title: "企业融资压力增加", note: "扩张成本变高" },
      { title: "消费降温", note: "居民支出趋缓" },
      { title: "就业可能承压", note: "企业减少招聘" },
      { title: "继续踩刹车的风险越来越高", note: "政策需要权衡" },
    ],
  },
  keyInsight: { kicker: "认知转折", title: "降息不一定意味着经济很好。", body: { lines: ["有时候恰恰意味着：", "央行开始担心经济被", "“刹”得太狠了。"], emphasis: "“刹”得太狠了。" } },
  assetSections: [
    {
      id: "stock-valuation", asset: "stocks", kicker: "从政策走向资产", title: ["那么，降息为什么", "会影响股票？"], intro: "先不讲公式，只看一笔未来的钱。", paragraphs: ["这 100 元今天值多少，取决于你现在能以多低的风险获得多少回报。"], visualType: "comparison", visualLabel: "SAFE RETURN · 10 年后", visualValue: "赚 100 元",
      comparisons: [
        { label: "SAFE RETURN", value: "2%", lines: ["未来利润更有吸引力"] },
        { label: "SAFE RETURN", value: "8%", lines: ["“为什么还要承担风险？”"] },
      ],
      flow: [{ title: "利率 ↓" }, { title: "未来利润现值 ↑" }, { title: "成长资产估值压力 ↓" }],
    },
    {
      id: "gold-and-rates", asset: "gold", kicker: "另一种不会生息的资产", title: ["黄金为什么也会", "盯着利率？"], paragraphs: ["黄金不会支付利息。当债券可以获得较高收益时，持有黄金的机会成本就会提高。", "当利率下降，安全资产收益的吸引力下降，黄金的相对吸引力可能提高。"], visualType: "asset", visualLabel: "GOLD PAYS", visualValue: "0%", visualUnit: "INTEREST",
      comparisons: [
        { label: "高利率", lines: ["债券吸引力 ↑", "黄金机会成本 ↑"] },
        { label: "低利率", lines: ["债券收益 ↓", "黄金机会成本 ↓"] },
      ],
      note: "但利率只是其中一条线索。黄金还受到美元、通胀预期和避险需求等因素影响，不能只看利率。",
    },
  ],
  evidence: {
    kicker: "EVIDENCE · 数据证据", title: ["政策转向之前，", "这些信号通常会先变化。"], demoLabel: "DEMO DATA", description: "以下数值仅用于验证未来真实财经数据的展示结构，不代表当前实时数据。",
    metrics: [
      { label: "核心通胀", value: "2.8%", note: "价格压力正在缓慢回落", progress: 56 },
      { label: "就业", value: "降温", note: "新增需求不再持续加速", progress: 48 },
      { label: "政策利率", value: "5.25%", note: "限制性水平维持较久", progress: 78 },
      { label: "市场降息预期", value: "25bp", note: "定价已经提前发生", progress: 64 },
    ],
  },
  expectationGap: {
    id: "expectations", kicker: "全页最重要的线索", title: { lines: ["但真正的投资者不会只问：", "“降息利好什么？”"], emphasis: "“降息利好什么？”" }, englishStatement: ["MARKETS TRADE", "EXPECTATIONS."], statement: { lines: ["市场交易的是", "预期差。"], emphasis: "预期差。" },
    cases: [
      { label: "CASE A · 情况 A", tone: "neutral", expected: "25bp", actual: "25bp", surprise: "0", result: "没有太大惊喜" },
      { label: "CASE B · 情况 B", tone: "highlight", expected: "25bp", actual: "50bp", surprise: "+25bp", questions: ["政策比预期更宽松？", "还是——", "经济比市场想象得更差？"] },
    ],
    insight: { lines: ["同样叫“降息”，", "背后的原因不同，", "市场结果可能完全不同。"], emphasis: "市场结果可能完全不同。" },
  },
  watchlist: {
    id: "what-to-watch", kicker: "WHAT TO WATCH · 接下来观察什么", title: ["理解过去之后，", "接下来盯住这些信号。"],
    items: [
      { name: "核心 PCE", reason: "它更接近美联储观察基础通胀压力的视角。" },
      { name: "非农就业", reason: "新增就业速度可以帮助判断劳动力需求是否继续降温。" },
      { name: "失业率", reason: "持续上升可能意味着高利率对就业的影响正在加深。" },
      { name: "10Y 美债收益率", reason: "它连接政策预期、增长预期和资产估值。" },
      { name: "美元指数", reason: "美元变化会把美国利率影响传导到全球资产。" },
    ],
  },
  reviewFramework: {
    kicker: "把判断框架带走",
    title: ["所以以后再看到“降息”，", "你先看这四件事。"],
    questions: ["为什么降？", "通胀发生了什么？", "就业和经济怎么样？", "市场已经预期了多少？"],
  },
  mentalModel: {
    kicker: "TODAY'S MENTAL MODEL", title: "不是“降息 = 股票涨”。", prefix: "而是", chain: ["政策", "经济", "预期", "资产价格"], tags: ["利率", "估值", "实际利率", "预期差"],
    primaryAction: { label: "我懂了，继续探索", href: "/#question" }, secondaryAction: { label: "再看一个案例", href: "/analysis?q=黄金为什么持续上涨？" },
  },
  sources: [
    { name: "Federal Reserve", description: "货币政策与政策沟通的来源结构占位。" },
    { name: "U.S. Bureau of Labor Statistics", description: "就业与通胀数据的来源结构占位。" },
    { name: "U.S. Bureau of Economic Analysis", description: "收入、消费与核心 PCE 数据的来源结构占位。" },
  ],
  sourceLabel: "Demo source structure",
  methodology: "当前案例全部使用 Mock 内容与演示数据。未来真实数据应标注发布日期、统计口径、更新时间和原始来源。",
} satisfies AnalysisStory;
