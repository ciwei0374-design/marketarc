# MarketArc Identifiers-Only Story A → Story B Handoff Design

Status: **OFFLINE DESIGN — AWAITING CHATGPT REVIEW**

Date: 2026-08-18

## 1. Design Goal

V0.3 Coverage Map 平均 1491.5 字符，复制了 thesis、flow 和完整结论，虽然 Bitcoin 改善，但 Nvidia 出现 repetition priming。新的设计只告诉 Story B“哪些概念已经覆盖”，不告诉它“Story A 是怎么说的”。

目标：

- deterministic extraction；
- 0 additional LLM calls；
- 不传 thesis、完整句子、flow、类比原文或结论；
- 只传短 identifier、机制标签与 section ownership；
- 目标平均 **180–400 chars**，硬上限建议 **500 chars**。

## 2. Proposed Internal Shape

```ts
type StoryAIdentifiers = {
  v: 1;
  owns: StoryAOwnershipId[];
  mechanisms: MechanismId[];
  terms: TermId[];
  analogy: AnalogyId[];
  storyBMustAdd: NoveltyValueId[];
};
```

允许值均为短 identifier，不允许自由文本：

```ts
type StoryAOwnershipId =
  | "BACKGROUND"
  | "PRIMARY_CAUSAL_CHAIN"
  | "CORE_INSIGHT"
  | "ANALOGY"
  | "EVIDENCE";

type NoveltyValueId =
  | "ASSET"
  | "EXPECTATION"
  | "CONDITION"
  | "COUNTERARGUMENT"
  | "OBSERVATION"
  | "MODEL";
```

`MechanismId`、`TermId`、`AnalogyId` 使用小型受控词表。第一版只覆盖已观察到的高频模式，例如：

- Mechanism：`BORROWING_COST`、`DEMAND_COOLING`、`DISCOUNT_RATE`、`FUTURE_CASHFLOW`、`ETF_FLOW`、`LEVERAGE_LIQUIDATION`、`RISK_ASSET_CORRELATION`、`EXPECTATION_PRICED_IN`、`EVENT_POSITION_UNWIND`、`VALUATION_THRESHOLD`。
- Term：`REAL_YIELD`、`DURATION`、`DISCOUNT_RATE`、`LEVERAGE`、`LIQUIDATION`、`VALUATION`、`EXPECTATION_GAP`、`BUY_RUMOR_SELL_NEWS`。
- Analogy：`ECONOMY_BRAKE`、`GLOBAL_VAULT`、`DIGITAL_FACTORY`、`LEVERAGE_DOMINO`、`REPORT_CARD`、`FUTURE_MONEY`。

词表不是新内容 Schema，也不进入 AnalysisStory；它只是 Story A→B 的内部 handoff vocabulary。

## 3. Deterministic Extraction Rules

只读取 PartialStoryA 已有字段：`analogy`、`background`、`keyInsight`、`evidence`。不读取 ResearchContext，不做 NLP summary。

1. `owns` 固定来自 PartialStoryA schema ownership，不分析正文。
2. `mechanisms`：在 `analogy.flow[].title`、`background.flow[].title`、`keyInsight.title` 中执行受控关键词匹配；命中后输出 identifier。
3. `terms`：在 PartialStoryA 全部字符串中匹配受控术语表；只输出 identifier。
4. `analogy`：根据 `analogy.id`、`visual.visualType` 与少量受控关键词映射为 identifier。
5. 去重、稳定排序、每类 hard cap：mechanisms ≤ 6、terms ≤ 6、analogy ≤ 1。
6. 未命中的内容直接省略；禁止为了“覆盖完整”回退为复制原文。

关键安全原则：**宁可少传 identifier，也不传一段摘要。** ResearchBrief 已提供事实输入；handoff 只负责避免重复。

## 4. Story B Contract

Story B 系统提示只需一条固定语义：

> `owns` 和 identifiers 表示 Story A 已完成的教学范围。可以引用对应概念，但不得重新教学、复用相同类比或重新展开相同主链。每个 Story B section 必须新增 ASSET / EXPECTATION / CONDITION / COUNTERARGUMENT / OBSERVATION / MODEL 中至少一种价值。

不把 identifier 展开成解释字典随请求重复传输。固定 identifier 的含义应在代码注释/单一 Prompt legend 中维护，而不是把 Story A 文案再次塞入输入。

## 5. Offline Examples

### Bitcoin

```json
{"v":1,"owns":["BACKGROUND","PRIMARY_CAUSAL_CHAIN","CORE_INSIGHT","ANALOGY","EVIDENCE"],"mechanisms":["ETF_FLOW","LEVERAGE_LIQUIDATION","RISK_ASSET_CORRELATION"],"terms":["LEVERAGE","LIQUIDATION"],"analogy":["LEVERAGE_DOMINO"],"storyBMustAdd":["ASSET","EXPECTATION","CONDITION","COUNTERARGUMENT","OBSERVATION","MODEL"]}
```

约 330 ASCII/JSON characters。没有复制“数字黄金”“机构化”“杠杆瀑布”等完整结论句。

### Nvidia

```json
{"v":1,"owns":["BACKGROUND","PRIMARY_CAUSAL_CHAIN","CORE_INSIGHT","ANALOGY","EVIDENCE"],"mechanisms":["EXPECTATION_PRICED_IN","EVENT_POSITION_UNWIND","VALUATION_THRESHOLD"],"terms":["VALUATION","BUY_RUMOR_SELL_NEWS","EXPECTATION_GAP"],"analogy":["REPORT_CARD"],"storyBMustAdd":["ASSET","EXPECTATION","CONDITION","COUNTERARGUMENT","OBSERVATION","MODEL"]}
```

约 360 ASCII/JSON characters。没有复制“好业绩不等于超预期”的 thesis 或 causal flow。

## 6. Offline Evaluation Against V0.3 Failure

| Risk | V0.3 Map | Identifiers-only design |
| --- | --- | --- |
| Repetition priming | 高：包含 thesis、claims、flow 原句 | 低：只含受控标签 |
| Context size | 平均 1491.5 chars | 样例约 330–360 chars |
| Topic portability | 依赖任意自由文本 | 依赖词表 coverage；未知机制可省略 |
| Hallucinated summary | 无 LLM，但截断摘要可能失真 | 无摘要，仅确定性命中 |
| Debuggability | 中：自然语言难稳定比较 | 高：identifier 可直接 diff/count |
| Information loss | 较低 | 中等，但这是有意约束 |

设计解决了 V0.3 最明显的输入复制问题，但尚未证明能提高内容质量。最大新风险是 taxonomy coverage：新主题若没有匹配 identifier，Story B 只能依赖 section ownership 与 ResearchBrief。该风险比回退复制原文更可控。

## 7. Proposed Future Acceptance Preconditions

在获 ChatGPT/Human 批准真实 Candidate 前，建议先满足：

1. 用现有 Bitcoin / Nvidia / Treasury Story A 离线提取，Map 平均 ≤400 chars、单篇 ≤500。
2. 同一 Story A 重复提取结果 byte-identical。
3. Map 中不存在超过 32 characters 的自由文本值。
4. 不增加 LLM call，不传完整 Story A。
5. 真实实验仍只用 Bitcoin + Nvidia，同一 V0.2 Rubric 和 Stability Gate。
6. Story B chars 墜长不应超过 5%；若增长超过 15%，仍执行原 +8 Density Gate。

## 8. Review Questions for ChatGPT

1. 是否接受受控 taxonomy 的维护成本，以换取可预测、可调试的 handoff？
2. `mechanisms` 是否应从第一版开始只保留 6–10 个高频 identifier，还是覆盖更广？
3. 未识别机制是否应完全省略（推荐），而不是回退自由文本？

本文件只完成离线设计。没有业务代码、Prompt、API 调用或 Candidate A/B。

