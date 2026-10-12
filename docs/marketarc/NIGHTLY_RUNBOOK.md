# MarketArc Autonomous Development Loop V0.1

Before executing any MarketArc product/content task,
read PRODUCT_BRAIN.md first.

## 启动检查

1. 先阅读 `PRODUCT_BRAIN.md`，再依次阅读产品原则、自治政策、ChatGPT Instructions 和 Decision Queue。
2. 记录当前 commit、branch、working tree 和 3001/3101 端口。
3. 保护用户未提交工作；优先使用隔离测试目录或 worktree。
4. 不停止、重启或占用 3001，不修改 cloudflared。
5. 确认本轮真实完整 Analysis 上限为 5，默认 Baseline 为 3。

## P0 Reliability

依次运行 3 个不同类别问题。每题记录：jobId、POST 响应时间、Research/Brief/Story A/Story B/Complete 时间、来源数量、Primary、Official、最终状态、HTTP、429、timeout、retry、finish reason、JSON/Partial/Final Validation 和 Cache。

任一题 FAIL：停止内容优化，定位 Root Cause。仅当问题属于 GREEN 时允许一个最小修复，并最多重新验证一次受影响问题。Provider 连续异常时停止真实调用。

## Content Quality

仅在 3 个 P0 全部 PASS 后执行。按 Quality Rubric 对实际 Story section 评分，给出证据、Strength 与 Weakness。找出三篇共同最低维度，只选择一个 Focus 和一个 Hypothesis。

## Candidate

只做一个 YELLOW 范围最小改动，对最多 2 个相同问题做 A/B。严格执行 Acceptance Gate。失败则恢复 Candidate，记录 REJECTED；每晚最多两轮。

## 收尾

更新 `NIGHTLY_REPORT.md`、`HANDOFF_TO_CHATGPT.md` 和必要的 Changelog/Decision Queue，运行 lint、typecheck、build。报告不得包含 Secret。没有安全改进是允许的结果。

## Scheduled Task Prompt

> Read PRODUCT_BRAIN.md first, then read the MarketArc autonomous development runbook and execute one bounded nightly iteration. Prioritize P0 reliability first, then one evidence-based content quality improvement. Respect AUTONOMY_POLICY.md, use the Eval Set, enforce the Acceptance Gate, and update NIGHTLY_REPORT.md and HANDOFF_TO_CHATGPT.md.
