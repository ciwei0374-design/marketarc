# MarketArc Autonomous Changelog

每个自动 Candidate 必须追加以下记录；未实际执行 Candidate 时不得虚构条目。

## Entry Template

- Date:
- Problem:
- Hypothesis:
- Files changed:
- Baseline score:
- Candidate score:
- Decision: ACCEPTED / REJECTED
- Reason:

## 2026-08-18 — Candidate 1

- Problem: Story B 多个 section 重复中心 thesis，Information Density 校准均分 57.3。
- Hypothesis: Prompt 未定义 section ownership，也未要求重复必须带来新增认知。
- Files changed: nightly worktree `src/services/ai/prompts/partial-story-composer.ts`（随后恢复）。
- Baseline score: 70.4 overall；57.3 Information Density。
- Candidate score: N/A。
- Decision: REJECTED
- Reason: `BLOCKED_BY_PERMISSION`；隔离 3101 server 无法创建 lockfile，真实 A/B 在 0 次 API 请求时停止。未验证 Candidate 已撤销，未来可在可写 worktree 中原样重试。

## 2026-08-18 — Candidate 1 resumed after workspace repair

- Problem: 同一 Story B thesis 跨 Asset、Expectation Gap、Watchlist、Mental Model 重复。
- Hypothesis: 明确 section ownership，并要求重复必须增加新条件、新反例、新证据或新判断动作，可提高 Information Density。
- Files changed: `nightly-worktree-v02/src/services/ai/prompts/partial-story-composer.ts`（测试后恢复）。
- Questions: 比特币为什么下跌？；为什么英伟达业绩很好，股价还是可能下跌？
- Baseline score: 两题 Information Density 52.0 average；Overall 69.1 / 66.2。
- Candidate score: Bitcoin N/A（Job failed）；Nvidia Information Density 54（+4），Overall 约 69.0（+2.8）。
- Decision: REJECTED
- Reason: Bitcoin Story B 首次 invalid JSON，retry 120s timeout，P0 Gate 失败；Nvidia 的目标维度与 overall 提升也低于 Gate，且仍存在跨 section 重复。Candidate 已恢复，未 merge。

## 2026-08-18 — Coverage Map V0.3

- Problem: Story B 不知道 Story A 最终实际覆盖内容，跨 section 重复机制。
- Hypothesis: 从 PartialStoryA 确定性提取 Coverage Map，并传给 Story B，可减少无新增价值的重复；不增加 LLM call。
- Files changed: nightly worktree 的 `story-a-coverage.ts`、Story A→B provider handoff、Story B Prompt（全部在决策后恢复）；保留 novelty audit 与 Eval evidence。
- Questions: 比特币为什么下跌？；为什么英伟达业绩很好，股价还是可能下跌？
- Baseline score: Information Density 52.0 average；Overall 67.65。
- Candidate score: Information Density 57.0（+5）；Overall 70.5（+2.85）。Bitcoin Density +12，Nvidia Density -2。
- Stability: 两题 P0 PASS，timeout/429/retry=0；Story B chars +25.7%，duration -51.6%。
- Decision: REJECTED
- Reason: Overall 未达到 +3；字符增长超过 15% 时 Density 未达到 +8；Nvidia repetition sections 2→4，跨主题不稳定。Hypothesis result: NOT SUPPORTED。Candidate 已恢复，未 merge。

## 2026-08-18 — Continuous Autopilot V1 / Cycle 1

- Problem: Story B 在 Asset、Expectation Gap、Watchlist 与 Mental Model 中重复 Story A 已解释的中心机制，Information Density 基线 57.3。
- Hypothesis: 只传受控短 identifier 与 section ownership，不传 thesis/flow 文本，可减少重复且避免 V0.3 repetition priming。
- Files changed: nightly worktree `story-a-identifiers.ts`、`partial-story-composer.ts`、`openai-compatible.ts`（Reviewer 决策后全部恢复）。
- Questions: 为什么美债收益率上涨会影响科技股？；为什么英伟达业绩很好，股价还是可能下跌？（另一次 Bitcoin 请求命中旧 AnalysisStory cache，未形成 Candidate）。
- Baseline score: Human-calibrated Overall 70.4；Information Density 57.3。
- Candidate score: N/A；P0 Gate 先失败，未进行质量打分。
- Reliability: Treasury complete、Story A/B 均一次成功；Nvidia Story A 成功，Story B 首次 invalid JSON，retry 后仍 invalid JSON；429=0、timeout=0。
- Decision: REJECTED
- Reason: 跨题验证中 Nvidia 最终 Job failed，违反 P0 Reliability / JSON Validation Gate。Candidate 已恢复，不允许通过微调重复本实验。

## 2026-08-18 — Continuous Autopilot V1 / Cycle 2

- Problem: Counterargument 校准均分仅 60.7，常退化为“仍有风险”，没有说明主逻辑失效的具体条件。
- Hypothesis: 在 Story B 增加一条 `IF X → Y mechanism → 原结论失效/修正` 合格标准，可产生真正的反方而不改 Schema。
- Files changed: nightly worktree `src/services/ai/prompts/partial-story-composer.ts`（Reviewer 决策后恢复）。
- Questions: 比特币为什么下跌？；为什么英伟达业绩很好，股价还是可能下跌？
- Baseline score: Overall 67.65 average；Counterargument 59 average（两题既有 calibrated baseline）。
- Candidate score: N/A；P0 Gate 先失败，未进行质量打分。
- Reliability: Bitcoin complete、Story A/B 一次成功；Nvidia Story A 成功，Story B 首次 invalid JSON，retry 后仍 invalid JSON；429=0、timeout=0。
- Decision: REJECTED
- Reason: Nvidia 最终 Job failed，违反 P0 Reliability / JSON Validation Gate。Candidate 已恢复。连续两个 Cycle 无安全改进，Autopilot 按规则提前停止为 `NO_SAFE_IMPROVEMENT`。
