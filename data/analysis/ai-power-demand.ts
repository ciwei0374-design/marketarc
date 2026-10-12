import type { AnalysisStory } from "@/types/analysis";

export const aiPowerDemandStory = {
  slug: "ai-power-demand",
  topic: "AI 为什么会带动电力需求？",
  category: "产业链研究",
  eyebrow: "MARKETARC · INDUSTRY EXPLAINED",
  title: { lines: ["很多人以为 AI 的竞争，", "只是芯片竞争。"], emphasis: "只是芯片竞争。" },
  subtitle: { lines: ["但 AI 模型最终吃的，还有一样东西：", "电。"], emphasis: "电。" },
  disclaimer: "投资教育演示 · 不构成投资建议",
  hook: "AI 从模型变成服务，需要一整套不会停机的物理基础设施，而电力是这套系统持续运行的底层投入。",
  analogy: {
    id: "digital-factory",
    kicker: "先看见 AI 的物理世界",
    title: ["数据中心是一座", "不会睡觉的数字工厂。"],
    paragraphs: ["传统工厂消耗原材料、燃料与电力；AI 数据中心消耗芯片、网络、冷却和大量电力。", "模型看起来存在于云端，但云的背后是持续运行的 GPU、服务器与数据中心。"],
    emphasis: "持续运行的 GPU、服务器与数据中心",
    bullets: ["GPU", "网络", "冷却", "大量电力"],
    flow: [
      { title: "AI 模型", note: "训练与推理需求" },
      { title: "算力", note: "GPU 持续工作" },
      { title: "数据中心", note: "承载服务器集群" },
      { title: "电力需求", note: "运行与散热负荷" },
      { title: "能源基础设施", note: "电网、设备与供给" },
    ],
    conclusion: { lines: ["AI 不只运行在芯片上，", "它也运行在电力系统上。"], emphasis: "它也运行在电力系统上。" },
    visual: { visualType: "brake-meter", ariaLabel: "数据中心持续电力负荷仪表盘", label: "DATA CENTER LOAD", scaleStart: "IDLE", scaleEnd: "FULL", value: "24/7", valueLabel: "UPTIME", footerLabel: "POWER", footerValue: "ALWAYS ON" },
  },
  background: {
    kicker: "从数字需求走向物理负荷",
    title: ["为什么不只是", "多交一点电费？"],
    paragraphs: ["大规模新增负荷不是插上电源那么简单。电必须被生产、输送、变压、分配，还需要冷却、储能和备用系统共同保证稳定运行。"],
    flow: [
      { title: "AI 使用量增长", note: "训练与推理增加" },
      { title: "服务器集群扩张", note: "设备数量与密度提高" },
      { title: "数据中心新增", note: "持续负荷接入" },
      { title: "电网容量承压", note: "输配电出现约束" },
      { title: "产业链向外扩散", note: "设备、能源、冷却与储能" },
    ],
  },
  keyInsight: {
    kicker: "产业链的认知转折",
    title: "AI 的瓶颈，未来可能不只是“有没有芯片”。",
    body: { lines: ["还可能是：", "有没有足够的电，", "以及电能不能送到数据中心。"], emphasis: "以及电能不能送到数据中心。" },
  },
  assetSections: [
    {
      id: "infrastructure-chain", asset: "infrastructure", kicker: "产业链继续向外扩散", title: ["从 POWER 开始，", "需求会走向哪些环节？"], intro: "电力需求的增长，会沿基础设施链条寻找容量。", paragraphs: ["发电解决电从哪里来，输变配电解决电如何到达，冷却与储能解决高密度负荷如何稳定运行。"], visualType: "comparison", visualLabel: "AI MODEL → GPU → DATA CENTER", visualValue: "POWER",
      comparisons: [
        { label: "GRID / TRANSFORMER", value: "输送", lines: ["电网、变压器与配电设备"] },
        { label: "COOLING / STORAGE", value: "稳定", lines: ["冷却、储能与备用电源"] },
      ],
      flow: [{ title: "POWER" }, { title: "GRID · 电网" }, { title: "TRANSFORMER · 变压器" }, { title: "COOLING · 冷却" }, { title: "ENERGY / STORAGE" }],
    },
    {
      id: "efficiency-counterpoint", asset: "efficiency", kicker: "但是事情没这么简单", title: ["使用量增长，", "不等于用电线性增长。"], intro: "AI 芯片能效和模型推理效率也在持续改善。", paragraphs: ["同样一次计算未来可能需要更少的电，但成本降低也可能刺激更多 AI 使用。最终电力需求取决于效率提升与使用量增长哪一边更快。"], visualType: "comparison", visualLabel: "DEMAND VS EFFICIENCY", visualValue: "≠ LINEAR",
      comparisons: [
        { label: "需求一侧", value: "↑", lines: ["模型使用量、数据中心利用率、服务规模"] },
        { label: "效率一侧", value: "↑", lines: ["芯片能效、推理优化、冷却效率"] },
      ],
      flow: [{ title: "AI 使用量增长" }, { title: "效率同步改善" }, { title: "净电力需求取决于两者差值" }],
      note: "电价、能源政策和电网建设周期，也会改变项目落地速度与最终经济性。",
    },
  ],
  evidence: {
    kicker: "EVIDENCE · 产业链状态", title: ["不要只看需求口号，", "去看项目有没有真正落地。"], demoLabel: "DEMO DATA", description: "以下为概念性产业状态，不是实时统计。它用于验证未来 CapEx、容量、交付周期与效率数据的展示方式。",
    metrics: [
      { label: "TECH CAPEX", value: "扩张", note: "算力基础设施投入方向示意", progress: 76 },
      { label: "DATA CENTER CAPACITY", value: "建设中", note: "新增容量落地方向示意", progress: 62 },
      { label: "TRANSFORMER LEAD TIME", value: "偏紧", note: "设备供给约束方向示意", progress: 82 },
      { label: "GPU EFFICIENCY", value: "改善", note: "单位计算能耗方向示意", progress: 70 },
    ],
  },
  expectationGap: {
    id: "expectations", kicker: "产业趋势不等于投资答案", title: { lines: ["市场可能已经提前交易：", "AI 会带动电力需求。"], emphasis: "AI 会带动电力需求。" }, englishStatement: ["DEMAND GROWTH", "IS NOT THE SURPRISE."], statement: { lines: ["真正要判断的是", "哪里超出预期。"], emphasis: "哪里超出预期。" },
    cases: [
      { label: "CASE A · 趋势已被定价", tone: "neutral", expected: "需求增长", actual: "如期增长", surprise: "0", result: "好故事不一定带来新定价" },
      { label: "CASE B · 建设超出预期", tone: "highlight", expected: "稳步建设", actual: "加速建设", surprise: "FASTER", questions: ["数据中心落地更快？", "还是——", "某个设备环节真正供不应求？"] },
    ],
    insight: { lines: ["不要简单地说“AI 利好电力股”。", "先找到那个", "需求增长 > 供给增长的环节。"], emphasis: "需求增长 > 供给增长的环节。" },
  },
  watchlist: {
    id: "what-to-watch", kicker: "WHAT TO WATCH · 接下来观察什么", title: ["从公司预算到电网设备，", "验证产业链是否真的加速。"],
    items: [
      { name: "大型科技公司 CapEx", reason: "它反映算力与数据中心投入是否仍在兑现。" },
      { name: "数据中心新增容量", reason: "已投运容量比规划口号更接近真实用电需求。" },
      { name: "电力需求预测", reason: "公用事业预测会影响发电与电网投资计划。" },
      { name: "电网投资", reason: "输配电资本开支决定新增负荷能否接入。" },
      { name: "变压器交付周期", reason: "交付时间可以帮助识别设备供给是否紧张。" },
      { name: "GPU 能效", reason: "单位计算耗电下降会改变需求增长斜率。" },
      { name: "数据中心 PUE", reason: "它衡量计算之外冷却与配套设施的能耗效率。" },
    ],
  },
  reviewFramework: {
    kicker: "把产业链框架带走", title: ["看到 AI 电力需求时，", "先问这四个问题。"], questions: ["数据中心真的在建设吗？", "新增负荷能否接入电网？", "哪个环节供给最难扩张？", "市场已经提前定价多少？"],
  },
  mentalModel: {
    kicker: "TODAY'S MENTAL MODEL", title: "AI 的物理基础，是能源基础设施。", prefix: "从数字需求走到", chain: ["AI", "算力", "数据中心", "能源基础设施"], tags: ["产业链", "CapEx", "数据中心", "电力", "供需", "预期差"],
    primaryAction: { label: "我懂了，继续探索", href: "/#question" }, secondaryAction: { label: "再看一个案例", href: "/analysis?q=美联储为什么降息？" },
  },
  sources: [
    { name: "Company capital expenditure reports", description: "大型科技公司资本开支来源结构占位。" },
    { name: "Grid and utility planning data", description: "用电预测与电网规划来源结构占位。" },
    { name: "Data center efficiency disclosures", description: "容量、PUE 与设备效率来源结构占位。" },
  ],
  sourceLabel: "Demo source structure",
  methodology: "本案例使用概念性 Mock 状态，不代表实时项目进度、公司指引或行业预测。未来应逐项标注数据期间与原始来源。",
} satisfies AnalysisStory;
