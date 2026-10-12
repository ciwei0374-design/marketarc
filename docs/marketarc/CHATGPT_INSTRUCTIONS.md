# ChatGPT Instructions for MarketArc Nightly

Before executing any MarketArc product/content task,
read PRODUCT_BRAIN.md first.

当前没有额外指令。

Nightly Codex 每次运行前必须依次读取：

1. `PRODUCT_BRAIN.md`
2. `01_PRODUCT_PRINCIPLES.md`
3. `AUTONOMY_POLICY.md`
4. `CHATGPT_INSTRUCTIONS.md`
5. `DECISION_QUEUE.md`

本文件由 ChatGPT 或用户更新后，其项目与质量指令优先于 Nightly 默认策略，但不能覆盖 Secret 保护、Git 数据安全、系统安全限制及用户明确指令。

# MARKETARC MANAGER AUTONOMOUS DELIVERY MODE

Instruction Source:
Human

Instruction Status:
COMPLETED_BY_CODEX

Priority:
MISSION_DELIVERY

Current Mission:
MARKETARC STABILIZE_POLISH_EXPAND_V1

Human Authorization:
APPROVED

Previous missions:
COMPLETED_AND_SUPERSEDED

Manager and Engineer are currently authorized to:

- make all GREEN decisions
- make bounded YELLOW product and implementation decisions inside this Mission
- diagnose, minimally fix, regress, accept, or revert without Human intermediate approval
- advance automatically through the locked Phase order in `ORCHESTRATION_PLAN.json`
- continue until Phase 6 completes, a RED decision is required, or the Mission is safely blocked

Engineer must still comply with:

- `PRODUCT_BRAIN.md`
- `AUTONOMY_POLICY.md`
- API limits
- P0 gates
- max cycle count
- provider stop conditions

## Control Priority

统一控制优先级如下：

1. `PRODUCT_BRAIN.md` = 产品宪法。
2. Human Decision = 最高任务决策。
3. Manager OVERRIDE = 可以在 Engineer 的下一安全节点改变方向。
4. Active Mission = Engineer 当前运行任务。
5. Old Completed Instructions = 不再限制新的 Mission。

已经 `COMPLETED` 或 `SUPERSEDED` 的旧指令，不能继续被当成当前权限边界。

## Shared Control State

Engineer 必须持续维护 `ORCHESTRATION_STATE.json`，将其作为 Human、ChatGPT Manager 与 Codex Engineer 三方共享的当前任务真相，并严格执行 `ORCHESTRATION_PLAN.json`。文件不得包含任何 Secret。

## Mission Phase Order

1. Story B / Coding / JSON Reliability
2. Link Integrity / 404 Source Links
3. Responsive UI Polish
4. Today Market V0.1
5. Investment Map V0.1
6. Full Product Regression

The order is locked and must not be skipped.

## Direct Human Prompt Rule

如果 Human 直接在 Engineer 对话中下达新的重大任务，Engineer 在真正执行前必须先将其登记进 `ORCHESTRATION_STATE.json`，至少记录 mission id、`source = human`、issuedAt、scope 和 status，使 Manager 能看到 Human 实际批准的任务。

## Live Status Rule

Engineer 每个 Phase 至少在以下节点更新 `ORCHESTRATION_STATE.json`：

- `PLANNING`
- `BUILDING`
- `TESTING`
- `REVIEWING`
- `PHASE_COMPLETE`

每次更新至少记录 currentPhase、currentTask、managerStatus、engineerStatus、lastEngineerResult、managerDecision、nextAction、riskFlags 和 updatedAt，并在 `phaseState` 中记录 checkpoint、attempt、filesChanged、apiJobsUsed 与 result。

## Failure and Human Interruption Policy

GREEN 或 Mission 内 YELLOW 失败后，自动执行 Diagnosis → Minimal Fix → Regression；同一问题最多两个合理修复尝试。超过限制后标记 `MISSION_BLOCKED`，不得无限重试。

只有更换模型/Provider、购买或引入付费服务、数据库、正式用户系统、支付/会员、改变产品定位或目标用户、荐股/自动交易、重大投资合规边界、大规模品牌重做、大规模核心 Schema 重构或重大架构迁移等 RED 决策，才暂停并请求 Human。

## Current Manager Instruction

Mission completed. All six locked phases passed. Do not start a new Mission without a new Human or Manager instruction. Final evidence is recorded in `DELIVERY_REPORT_V1.md`.
