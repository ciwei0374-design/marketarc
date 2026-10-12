# MarketArc Autonomy Policy

本政策约束所有自动开发、Nightly Eval 和 Candidate 实验。安全规则、Secret 保护和 Git 数据安全始终拥有最高优先级。

## GREEN：允许自动修改

- 明确 Runtime、JSON parse、Job 状态、Polling、缓存和 API 错误处理 Bug。
- Schema 的局部兼容修复，但不得改变 AnalysisStory 的产品含义。
- 已有 Provider 机制的局部稳定性修复，包括 429、timeout 和安全日志。
- 测试、Eval infrastructure、报告与文档。
- 明显重复且不改变含义的 Prompt 表述。
- 明显降低内容质量的固定模板语言。

GREEN 修改仍须小步进行，并运行相关测试、lint、typecheck 和 build。

## YELLOW：只允许受控实验

- Research、Story A、Story B Prompt 调整。
- 内容结构权重、解释方式、Expectation Gap、Counterargument、Watchlist Prompt 调整。

YELLOW 必须执行：Baseline → 单一 Candidate → 同题 A/B → Quality Eval → Acceptance Gate。通过前只能标记 `ACCEPTED_CANDIDATE`，不得直接视为稳定版本。

## RED：禁止自动执行

- 更换 Provider、模型，购买或接入新 API。
- 修改产品定位、目标用户或核心 AnalysisStory 架构。
- 新增荐股、交易建议、自动交易、数据库、正式登录、会员、支付、数字资产专区或投资地图。
- 大规模 UI、Story Engine 或 Provider 重构。
- 删除重要正文换取速度。

发现 RED 建议时，只写入 `DECISION_QUEUE.md`，等待用户或 ChatGPT 决策。

## 运行边界

- 不停止、不重启、不占用公网 Demo 的 3001 服务，不修改或关闭 cloudflared。
- 测试优先使用隔离 worktree/副本和 3101，或自动选择的其他空闲端口。
- 每次 Nightly 默认 3 次完整 Baseline，整轮最多 5 次真实完整 Analysis。
- 连续 2 次 429、连续 timeout 或大面积 5xx 时停止真实生成，标记 `PROVIDER_UNSTABLE`。
- P0 有任何 FAIL 时停止内容优化，只允许 GREEN 范围的最小稳定性修复与一次验证。
- 每晚最多 2 个 Candidate iteration；没有安全改进时输出 `NO SAFE IMPROVEMENT FOUND`。

## Git 与 Secret

- 开始时记录 commit、branch、working tree。
- 不覆盖、丢弃或提交用户未提交工作。
- `.env.local` 只能安全复制到 gitignored 的隔离测试目录，禁止提交。
- 报告和日志不得包含 API Key、Cookie、体验码、Authorization 或 `.env` 内容。

