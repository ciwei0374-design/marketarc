# MarketArc Content Quality Rubric

Rubric Version: **V0.2 HUMAN CALIBRATED**

评分必须同时应用 `QUALITY_CALIBRATION.md` 的 70/80/90 Anchor、WHY Chain、Jargon、Repetition、Counterargument 与 Insight Tests。字段存在、结构完整和篇幅长不构成高分证据。

每项 0–100。任何低于 80 的维度必须引用具体 section、指出具体问题及其影响。每篇评价至少给出一个 Strength 和一个 Weakness，不得只输出总分。

## A. Fact Reliability

重要事实是否来自真实来源；数字、政策与公司业绩是否有证据；事实与推断是否明确分开。

## B. Causal Completeness

是否补齐 A → C 中间的 B；用户能否理解机制为什么成立。

## C. Beginner Clarity

非专业用户是否能读懂；是否出现用术语替代解释。

## D. Jargon Explanation

Carry Trade、Real Yield、Duration、Risk Premium、Liquidity、Discount Rate 等第一次出现前，是否先用普通语言解释其实际过程。

## E. Insight Gain

是否产生新闻摘要之外的认知增量，让用户得到“原来如此”的理解。

## F. Expectation Gap

是否解释市场原先预期、实际情况及两者差异，说明为什么利好或利空不等于价格必然变化。

## G. Counterargument

是否说明什么条件下主逻辑可能失效，是否提供真实反方因素。

## H. What to Watch

用户看完后是否知道应该继续观察哪些指标，以及每项为什么重要。

## I. Source Quality

是否用 Primary Source 确立事实，用高质量金融媒体补充市场背景；来源是否真实绑定。

## J. Information Density

是否存在 AI 套话、重复结论、重复机制或没有认知增量的段落。

## Acceptance Gate

Candidate 只有同时满足以下条件才可接受：

- P0 Reliability、JSON/Schema 稳定性无下降。
- 不新增 429 或 timeout。
- 目标维度平均提高至少 5 分。
- 整体质量平均提高至少 3 分。
- 任一关键维度不得下降超过 5 分。
- 不新增明显事实幻觉、重复或无必要篇幅。
- 质量仅提高 2–3 分但总延迟增加超过 30% 时默认 Reject。
- 质量提高超过 8 分但性能明显变慢时，写入 Decision Queue，等待人类判断。
