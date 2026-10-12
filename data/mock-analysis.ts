export type MockAnalysis = {
  summary: string;
  event: string;
  reasons: string[];
  moneyFlow: string[];
  assets: { name: string; detail: string }[];
  cautionTitle: string;
  caution: string;
  tags: string[];
  method: string[];
};

const rateCut: MockAnalysis = {
  summary: "降息本质上就是降低“钱的价格”，希望企业和居民更愿意借钱、投资和消费。",
  event: "美联储降低政策利率，意味着整个金融体系的资金成本可能发生变化。",
  reasons: ["经济增长放缓", "通胀压力下降", "维持高利率的必要性下降", "货币政策开始转向"],
  moneyFlow: ["利率下降", "安全资产收益发生变化", "投资者重新寻找收益", "股票、债券、黄金等资产重新定价"],
  assets: [
    { name: "股票", detail: "融资成本以及估值可能发生变化。" },
    { name: "债券", detail: "市场利率变化会影响债券价格。" },
    { name: "黄金", detail: "实际利率和美元是重要变量。" },
  ],
  cautionTitle: "降息 ≠ 所有资产都会上涨。",
  caution: "如果降息背后意味着经济快速恶化，市场可能首先交易经济衰退。",
  tags: ["利率", "流动性", "预期差"],
  method: ["为什么发生？", "市场原来预期什么？", "现在和预期有什么不同？"],
};

const goldRise: MockAnalysis = {
  summary: "黄金上涨通常不是单一原因，而是利率、美元、避险需求和央行购金共同作用的结果。",
  event: "当持有现金和债券的实际回报下降，或市场不确定性上升时，不产生利息的黄金会变得更有吸引力。",
  reasons: ["降息预期升温", "实际利率可能回落", "全球不确定性增加", "黄金配置需求上升"],
  moneyFlow: ["无风险收益预期下降", "美元与实际利率发生变化", "资金寻找保值与分散工具", "黄金需求和价格重新定价"],
  assets: [
    { name: "黄金", detail: "实际利率、美元和避险情绪是核心观察变量。" },
    { name: "黄金矿业股", detail: "金价上涨可能改善利润，但仍受成本和经营质量影响。" },
    { name: "美元资产", detail: "美元强弱会影响全球投资者购买黄金的成本。" },
  ],
  cautionTitle: "金价创新高 ≠ 上涨没有风险。",
  caution: "一旦利率预期、美元走势或避险情绪反转，黄金也可能出现快速调整。",
  tags: ["实际利率", "避险", "央行购金"],
  method: ["实际利率正在上升还是下降？", "美元处于什么趋势？", "上涨来自交易情绪还是长期配置？"],
};

const aiPower: MockAnalysis = {
  summary: "AI 的算力来自数据中心，而高密度芯片运行和散热都需要持续、稳定的大量电力。",
  event: "大模型训练和推理需求增长，推动科技公司建设更多数据中心，也让电网容量成为算力扩张的重要约束。",
  reasons: ["AI 应用快速增长", "算力基础设施扩张", "单机柜功率密度提高", "电力与散热需求同步上升"],
  moneyFlow: ["科技公司增加资本开支", "数据中心建设加速", "电网与发电项目获得投资", "设备、能源和服务需求重新定价"],
  assets: [
    { name: "公用事业", detail: "用电需求增长带来机会，也考验资本开支和监管回报。" },
    { name: "电力设备", detail: "变压器、配电与储能设备可能面临新增需求。" },
    { name: "能源", detail: "稳定供电要求让天然气、核电和可再生能源被重新评估。" },
  ],
  cautionTitle: "用电需求增长 ≠ 所有电力公司都会受益。",
  caution: "电网瓶颈、建设周期、监管定价与融资成本，都会影响需求最终转化为利润的程度。",
  tags: ["算力", "资本开支", "电网"],
  method: ["需求增长发生在哪个环节？", "谁掌握稀缺资源和定价权？", "收入增长能否覆盖新增投入？"],
};

const generic: MockAnalysis = {
  summary: "看懂财经事件的关键，是把表面新闻拆成原因、传导路径和市场预期三个部分。",
  event: "这件事正在改变投资者对增长、成本或未来现金流的判断，因此可能引发相关资产重新定价。",
  reasons: ["新的信息出现", "市场修正原有判断", "资金重新衡量风险与回报", "资产价格作出反应"],
  moneyFlow: ["事件改变预期", "风险偏好发生变化", "资金重新选择资产", "价格反映新的共识"],
  assets: [
    { name: "相关公司", detail: "关注收入、成本和竞争格局是否真正改变。" },
    { name: "上下游行业", detail: "事件可能沿产业链传导，但不同环节影响并不相同。" },
    { name: "避险资产", detail: "不确定性上升时，资金可能更重视安全性与流动性。" },
  ],
  cautionTitle: "新闻很重要 ≠ 价格一定按直觉变化。",
  caution: "市场交易的是现实与预期之间的差异。同一条消息，在不同预期背景下可能产生完全不同的价格反应。",
  tags: ["传导路径", "风险", "预期差"],
  method: ["为什么现在发生？", "它影响了谁的收入或成本？", "当前价格已经反映了多少？"],
};

const cases: Record<string, MockAnalysis> = {
  "美联储为什么降息": rateCut,
  "黄金为什么持续上涨": goldRise,
  "AI为什么会带动电力需求": aiPower,
};

function normalizeQuestion(question: string) {
  return question.replace(/[？?。！!\s]/g, "").toUpperCase();
}

export function getMockAnalysis(question: string): MockAnalysis {
  return cases[normalizeQuestion(question)] ?? generic;
}
