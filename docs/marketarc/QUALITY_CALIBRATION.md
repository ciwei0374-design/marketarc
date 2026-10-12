# MarketArc Quality Calibration V0.2

Date: 2026-08-18

Human Anchor: 约 70 / 100

本校准读取三篇 Bootstrap 的完整 ResearchBrief、Story A、Story B、AnalysisStory 与 Sources，并只读比较 Fed、Gold、AI Power 三篇 Golden Stories。评分不奖励“字段齐全”本身；结构存在但内容形式化，只能证明 P0 schema 完整，不能证明内容达到 80 分。

## 70 / 80 / 90 Anchor

### 70

事实大致可靠、结构基本完整、主要结论能读懂，但仍有明显 AI 模板感。常见表现是只解释第一层因果，用术语替代参与者行为；Expectation Gap、Counterargument、Watchlist 虽然存在，却分别像固定模块、风险免责声明和指标清单。同一逻辑跨多个 section 重述，文章看似很长，认知增量有限。用户感受是“讲得挺清楚”，但很少出现“原来如此”。

### 80

多数核心机制回答至少两层 WHY；专业词第一次出现前，读者已经理解谁做了什么、为什么做、变化如何传导。至少有 2–3 个明确认知增量。Expectation Gap 连接预期、事实和价格；Counterargument 能指出主链条在哪个具体条件下失效；Watchlist 告诉用户指标怎样变化时应如何更新判断；Mental Model 能迁移到类似事件。每段都有新增价值，用户能复述主要逻辑。

### 90

90+ 应罕见。除事实和一手来源充分外，叙事必须自然、复杂机制显著变简单、专业词几乎没有理解门槛，并揭示多个非显然联系。Expectation Gap 融入定价逻辑；Counterargument 足以推翻或修正 thesis；Watchlist 能教用户独立判断；Mental Model 高度可迁移。没有明显模板、AI 套话、重复机制或为了专业感而堆砌术语。

## Five Strict Tests

### Test A — WHY Chain

对每个核心结论追问：WHY 1 是什么直接原因；WHY 2 为什么上一个变量会影响下一个变量；WHY 3 哪个条件会让传导不成立。少于两层 WHY 时，Causal Completeness 不得高分。

### Test B — Jargon

扫描实际利率、流动性、风险偏好、贴现率、久期、风险溢价、Carry Trade、估值、利差、期限溢价、资本成本、机会成本等。中文术语加英文名、或一句词典定义，都不算充分解释；术语出现前必须先让用户看见真实参与者和经济行为。

### Test C — Repetition

比较 Hero、Background、Key Insight、Asset、Expectation Gap、Mental Model。后文若没有增加新原因、例子、反例、数据或判断，只是换一种说法重复，标记 `LOW INFORMATION DENSITY`。

### Test D — Counterargument

“仍有不确定性”“未来可能变化”无效。有效反方必须表达：如果 X 发生，A → B 会被 Y 抵消，因此资产未必按主逻辑运行。

### Test E — Insight

逐段计分：重述前文为 0；补充未知中间机制为 1；揭示反直觉联系、预期机制、隐藏变量、二阶影响或条件关系为 2。

## Pairwise Review

### 比特币下跌 vs Gold Golden

| Dimension | Result | Evidence |
| --- | --- | --- |
| Hook | CANDIDATE BETTER | “数字黄金却在冲突中下跌”冲突更强。 |
| Narrative Flow | GOLDEN BETTER | Golden 以四股力量推进；Candidate 在机构化、杠杆和避险叙事间来回重述。 |
| Causal Explanation | COMPARABLE | Candidate 能串起 ETF 撤资、价格下跌和清算；Golden 的机会成本链更克制。 |
| Beginner Clarity | GOLDEN BETTER | Golden 先解释保险箱与机会成本；Candidate 出现 early adopters、去相关等未充分解释词。 |
| Jargon Explanation | GOLDEN BETTER | Golden 在“实际利率”前先讲债券真实回报；Candidate 多处术语先于行为解释。 |
| Insight Gain | CANDIDATE BETTER | “持有人结构改变资产表现”是有效非显然联系。 |
| Expectation Gap | COMPARABLE | 两者都明确区分叙事/预期与实际定价。 |
| Counterargument | GOLDEN BETTER | Golden 明确说明黄金也会受美元等因素影响；Candidate 未充分说明数字黄金何时重新成立。 |
| Information Density | GOLDEN BETTER | Candidate 在 Hook、Key Insight、Expectation Gap 重复同一套机构化与杠杆结论。 |
| Mental Model | COMPARABLE | “闸门与暗流”有迁移性，但比 Golden 四因素模型更复杂。 |

### 美债收益率与科技股 vs Fed Golden

| Dimension | Result | Evidence |
| --- | --- | --- |
| Hook | COMPARABLE | 都用反直觉市场现象建立问题。 |
| Narrative Flow | COMPARABLE | 从收益率到估值再到资产轮动，整体连续。 |
| Causal Explanation | CANDIDATE BETTER | “未来现金流折回今天”把贴现机制讲得较完整。 |
| Beginner Clarity | COMPARABLE | 漏斗类比有效，但后半篇部分金融概念密度上升。 |
| Jargon Explanation | COMPARABLE | 久期先有现金流距离解释，达到基本人话化。 |
| Insight Gain | COMPARABLE | “伤害的是耐心价格”有认知增量，但后续扩展有限。 |
| Expectation Gap | GOLDEN BETTER | Golden 用 25bp/50bp 的具体差异把政策、经济和市场反应绑在一起。 |
| Counterargument | GOLDEN BETTER | Candidate 对盈利增长如何抵消贴现率上升缺少具体条件。 |
| Information Density | GOLDEN BETTER | Candidate 多次重复“远期现金流对利率敏感”。 |
| Mental Model | COMPARABLE | “科技股像长期债券”可迁移，但仍需提醒股票现金流并非债券固定支付。 |

### 英伟达业绩与股价 vs Fed Golden

| Dimension | Result | Evidence |
| --- | --- | --- |
| Hook | CANDIDATE BETTER | “优等生困境”直观表达绝对成绩与预期门槛。 |
| Narrative Flow | GOLDEN BETTER | Golden 每屏推进一个问题；Candidate 后半篇围绕“好不等于超预期”循环。 |
| Causal Explanation | COMPARABLE | Candidate 有提前定价、催化剂消失、获利了结、估值收缩链，但部分环节证据不足。 |
| Beginner Clarity | GOLDEN BETTER | Candidate 的 posterior、反身性、前景理论显著提高理解门槛。 |
| Jargon Explanation | GOLDEN BETTER | Golden 先讲钱的价格；Candidate 在 Mental Model 一次引入四套理论。 |
| Insight Gain | COMPARABLE | “优等生及格线不断提高”有效，但重复削弱增量。 |
| Expectation Gap | CANDIDATE BETTER | 绝对业绩、隐含门槛和价格反应对照非常明确。 |
| Counterargument | GOLDEN BETTER | Candidate 只简述长期 AI 需求未变，没有给出可推翻 thesis 的观测条件。 |
| Information Density | GOLDEN BETTER | Hook、Key Insight、Expectation Gap 和 Mental Model 重复中心结论。 |
| Mental Model | GOLDEN BETTER | Golden 的政策→经济→预期→资产价格更可迁移；Candidate 堆叠多种理论。 |

## Calibrated Re-score

| Story | Original | Calibrated | Difference | Reason |
| --- | ---: | ---: | ---: | --- |
| 比特币为什么下跌？ | 79.4 | 69.1 | -10.3 | 有强洞察，但重复、术语门槛、反方与观察条件不足，符合严格 70 Anchor。 |
| 美债收益率为何影响科技股？ | 83.7 | 76.0 | -7.7 | 因果解释最成熟，但反方仍形式化，重复的贴现机制阻止其达到 80。 |
| 英伟达好业绩为何仍可能跌？ | 77.2 | 66.2 | -11.0 | Hook 与预期差强，但术语堆叠、来源绑定和重复显著，低于 70 Anchor。 |

Calibrated Average: **70.4 / 100**

| Story | Fact | Causal | Beginner | Jargon | Insight | Expectation | Counter | Watch | Sources | Density |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 比特币 | 72 | 75 | 74 | 62 | 76 | 78 | 58 | 66 | 76 | 54 |
| 美债收益率 | 78 | 82 | 80 | 76 | 78 | 82 | 64 | 72 | 80 | 68 |
| 英伟达 | 66 | 72 | 70 | 56 | 74 | 82 | 60 | 64 | 68 | 50 |

Weakest dimensions: Information Density 57.3；Counterargument 60.7；Jargon Explanation 64.7。

## Calibration Conclusion

旧评分高估约 9.7 分，核心原因是把 schema 完整、存在某个 section、篇幅较长误当成内容成熟。严格校准后与 Human Anchor 约 70 基本一致，且能够逐 section 指出证据，满足进入一个受控 Candidate 实验的条件。

