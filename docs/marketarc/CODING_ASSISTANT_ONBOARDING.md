# MarketArc / 资见 AI — Coding Assistant 接管指令

> 用途：把本文件交给新的 Coding Agent、IDE Agent 或其他编程软件，让它在修改代码前快速理解项目、产品目标、当前架构和安全边界。
>
> 项目根目录：`D:\Codex.project\demo1`

---

## 一、可以直接复制给新 Coding Agent 的启动指令

```text
你现在接手项目：资见 AI / MarketArc。

项目根目录是：
D:\Codex.project\demo1

在做任何修改前，请先完成“只读接管”，不要立即写代码：

1. 完整阅读：
   - AGENTS.md
   - README.md
   - docs/marketarc/PRODUCT_BRAIN.md
   - docs/marketarc/AUTONOMY_POLICY.md
   - docs/marketarc/CODING_ASSISTANT_ONBOARDING.md

2. 检查：
   - git status --short
   - package.json
   - src/app、src/components、src/services、src/types 的实际结构
   - data 目录的结构，但不要输出或提交用户业务数据

3. 如果任务涉及 Next.js，请先阅读本项目 node_modules/next/dist/docs/ 中与任务有关的文档。本项目使用 Next.js 16，不要凭旧版 Next.js 经验直接修改。

4. 用不超过 12 条内容向我汇报：
   - 你理解的产品定位
   - 当前核心用户流程
   - 本次任务可能涉及的文件
   - 你识别到的风险
   - 你的最小修改方案

5. 未得到明确任务时，不要主动重构、升级依赖、修改 Prompt、修改 Schema、切换 Provider、增加页面或扩展功能。

长期产品原则：

- 中文名：资见 AI；英文名：MarketArc。不要使用 ZIJIAN AI。
- 产品面向 25–40 岁普通投资者，帮助用户看懂财经事件并建立自己的投资判断。
- 产品不是荐股工具，不提供确定性涨跌预测、收益保证、买卖指令或自动交易。
- 内容必须先用普通语言讲清行为和因果，再引入专业术语。
- 重要分析必须尽量包含：因果链、预期差、反方条件、观察指标和可迁移的 Mental Model。
- 信息与新闻不是最终产品；“理解 + 判断”才是产品价值。

工程边界：

- 不允许删除已有功能，除非用户明确要求。
- 不允许把 API Key、Cookie、体验码、Authorization 或 .env 内容写入源码、日志或回复。
- 所有业务数据、缓存、Job 和上传内容必须保存在项目根目录内，默认位于 data/。
- .env.local 不得读取后展示，不得提交 Git。
- 修改前先理解现有代码；每次只做与当前任务有关的最小改动。
- 不要覆盖或丢弃当前工作区中已有的未提交修改。
- 公网 Demo 使用 3001 时，不得停止、重启或占用它。自动测试优先使用 3101 或其他隔离端口。
- 不要把真实 AI、搜索或网络测试说成成功，除非确实执行并取得证据。
- 任何重大架构决定需要记录到 README.md。

当前核心链路：

User Question
→ Demo Access Gate
→ Async Analysis Job
→ Research Planner
→ Tavily Research / ResearchContext
→ Stage 1 Research Analyst / ResearchBrief
→ Story A
→ Story B
→ Deterministic Merge
→ AnalysisStory Validation
→ Story Engine
→ Quick Take / 渐进式故事 / Sources
→ 项目内本地缓存

重要稳定边界：

- Story Engine、AnalysisStory、ResearchBrief 和三个 Golden Stories 都是稳定资产，不要为了普通功能随意修改。
- AI Provider 与 Research Provider 相互独立。
- 当前 AI 使用 OpenAI-Compatible Chat Completions Adapter，模型和地址来自环境变量，业务页面不能依赖具体厂商。
- 当前 Search Provider 为 Tavily；来源质量强调 Primary / Official 优先，高质量媒体补充背景。
- 三个 Golden Stories 必须在没有 API Key 时仍能正常打开。
- API 未配置时，网站、首页、导航和 Golden Stories 仍必须正常运行。
- 长分析使用异步 Job 和渐进式展示；失败修复不得无故重新执行已经成功的 Research 或前序阶段。
- 当前 GonkaRouter 稳定策略通常使用 AI_MAX_CONCURRENCY=1；不要未经测试恢复并发。
- Demo Access Gate 不只保护页面，还必须保护会产生 Kimi / Tavily 成本的 API。

默认修改流程：

理解现状
→ 明确单一问题
→ 查看相关调用链
→ 提出最小修改
→ 实施
→ 运行针对性测试
→ npm run lint
→ npm run typecheck
→ npm run build
→ 检查 git diff
→ 汇报修改文件、验证结果、剩余风险

如果任务属于内容 Prompt 或研究策略调整，必须遵循：

Baseline
→ 单一 Hypothesis
→ 最小 Candidate
→ 同题 A/B
→ Quality Eval
→ Acceptance Gate
→ Accept 或 Reject

不要一次同时修改多个内容变量。

如果我的新要求与 PRODUCT_BRAIN.md 明显冲突，先指出冲突和影响，不要擅自扩大任务范围。

现在先执行只读接管，等待我的具体任务。
```

---

## 二、项目是什么

资见 AI（MarketArc）是一款面向普通投资者的 AI 财经理解与投研教育产品。

用户输入一个财经事件或问题，系统通过真实来源研究、结构化推理和故事化页面，帮助用户理解：

- 真正发生了什么；
- 为什么发生；
- 中间经过了哪些传导环节；
- 为什么会影响股票、债券、黄金、汇率或产业链；
- 市场此前已经预期了什么；
- 什么情况可能让主逻辑失效；
- 接下来应该观察哪些变量。

用户看完后的理想反应不是“AI 总结得不错”，而是：

> 原来如此。下一次遇到类似事情，我知道应该从哪里开始分析。

### 产品不是这些东西

- 不是新闻聚合器；
- 不是传统证券行情软件；
- 不是股票预测器；
- 不是荐股、喊单或自动交易工具；
- 不是用专业术语包装的 AI 摘要器。

---

## 三、当前用户可以体验什么

### 1. 首页

用户可以输入任意财经问题，也可以点击示例问题。三个 Golden Stories 不需要 AI 或搜索配置：

- 美联储为什么降息？
- 黄金为什么持续上涨？
- AI 为什么会带动电力需求？

### 2. 真实研究流程

其他问题会进入异步真实研究。页面渐进显示：

1. 正在规划研究方向；
2. 正在寻找可靠来源；
3. 正在梳理关键事实；
4. Quick Take；
5. Story A；
6. Story B；
7. 完整 Analysis Story 与 Sources。

### 3. 今日市场

`/today` 使用项目内快照，以 FACT、INFERENCE、UNCERTAINTY 区分事实、解释与不确定性。

### 4. 投资地图

`/map` 用“事件 → 机制 → 资产影响 → 反方条件 → 观察指标”帮助用户学习条件性判断，不产生买卖指令。

### 5. Demo Access Gate

配置 `DEMO_ACCESS_CODE` 后，公网访问必须先通过体验码。授权状态由服务端可验证的 HttpOnly Cookie 保存；真实分析 API 同样受保护。

---

## 四、技术栈与目录地图

### 技术栈

- Next.js 16 / App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Zod
- OpenAI-Compatible Chat Completions Adapter
- Tavily Research Provider
- 项目内文件缓存与异步 Job
- SQLite 预留路径：`data/app.db`

### 主要目录

| 路径 | 作用 |
| --- | --- |
| `src/app` | 页面、布局和 Route Handlers |
| `src/components` | 页面与 Story Engine 组件 |
| `src/components/analysis-story` | AnalysisStory 的稳定渲染层 |
| `src/services/ai` | Provider-Agnostic AI 服务、Prompt 与 Provider Adapter |
| `src/services/research` | Research Provider、ResearchContext 与来源处理 |
| `src/types` | AnalysisStory、ResearchBrief 等统一数据契约 |
| `src/lib` | 缓存、Job、访问控制和基础工具 |
| `data/analysis` | 三个 Golden Stories |
| `data/jobs` | 异步分析 Job 状态 |
| `data/research` | ResearchContext 缓存 |
| `data/briefs` | ResearchBrief 缓存 |
| `data/generated` | 最终 AnalysisStory 缓存 |
| `data/market` | 今日市场与投资地图的本地数据 |
| `docs/marketarc` | 产品宪法、自治规则、评估与交接文档 |
| `scripts` | Provider 测试、回归、Eval、Secret Scan 和 Orchestrator |

不要仅凭这张表推断实际代码；执行任务前必须查看当前文件和调用关系。

---

## 五、稳定架构和不可随意破坏的契约

### AnalysisStory

`AnalysisStory` 是模型输出与前端渲染之间的统一接口。模型只生成可序列化 JSON，不生成 HTML、JSX、ReactNode 或样式。

典型链路：

```text
LLM Provider
→ JSON normalize / parse
→ Zod validation
→ AnalysisStory
→ Story Engine
```

没有明确产品需求时，不要修改它的主体结构。

### Research Layer

Research Provider 独立于 AI Provider：

```text
Question
→ ResearchProvider
→ ResearchContext
→ Research Analyst
```

更换搜索服务时，应新增 Adapter，而不是改 Story Engine 或页面。

### 两阶段内容生成

```text
ResearchContext
→ Stage 1 Research Analyst
→ ResearchBrief
→ Story A + Story B
→ Deterministic Merge
→ AnalysisStory Validation
```

- Stage 1 负责事实重要性、因果链、预期差、反方和来源绑定；
- Story A 负责把事情讲懂；
- Story B 负责资产影响、Expectation Gap、Counterargument、Watchlist 和 Mental Model；
- 最终合并由代码完成，不增加模型合并调用。

### Provider-Agnostic

页面、Story Engine 和 AnalysisStory 不应依赖 GonkaRouter、Kimi 或 Tavily 的专有概念。

OpenAI-Compatible 服务通常通过以下环境变量切换：

```env
AI_PROVIDER=openai-compatible
AI_BASE_URL=
AI_API_KEY=
AI_MODEL=
AI_RESEARCH_MODEL=
AI_STORY_MODEL=
AI_RESEARCH_THINKING=disabled
AI_MAX_CONCURRENCY=1
```

搜索层通过：

```env
SEARCH_PROVIDER=none
TAVILY_API_KEY=
```

实际值只存在于 `.env.local`。任何 Agent 都不得在回复、日志或提交中展示这些值。

---

## 六、内容质量标准

### 先解释，再命名

错误写法：

> Carry Trade unwind 导致风险资产承压。

正确思路：

先解释投资者为什么借低息日元、如何换成其他货币并购买高收益资产，以及日本加息或日元升值为什么会迫使他们卖出海外资产、换回日元还债；最后再告诉用户，这叫“套息交易平仓”。

### 每个核心部分至少回答一个“为什么”

流程图只能总结正文，不能代替正文。禁止只输出：

```text
A → B → C
```

却不解释参与者为什么从 A 走向 B。

### 三项关键能力

1. **Expectation Gap**：现实相对预期发生了什么变化？
2. **Counterargument**：什么具体条件会打断主逻辑？
3. **What To Watch**：用户下一步观察什么，以及为什么？

### 来源边界

- Tier 1：央行、政府、统计机构、监管机构、交易所、公司 IR、公告、SEC Filing、国际组织；
- Tier 2：Reuters、FT、Bloomberg、WSJ、CNBC、Nikkei 等高质量财经媒体；
- 一手来源确定事实，媒体补充背景；
- 明确区分 FACT、INFERENCE、UNCERTAINTY；
- 不得伪造实时数据、数字、链接或来源。

---

## 七、新 Agent 的首次接管清单

### 必须先读

1. `AGENTS.md`
2. `README.md`
3. `docs/marketarc/PRODUCT_BRAIN.md`
4. `docs/marketarc/AUTONOMY_POLICY.md`
5. 本文件

如果是 Nightly / Autonomous 任务，再按 `AGENTS.md` 指定顺序读取相关控制文件。

### 必须先检查

```bash
git status --short
npm run typecheck
```

不要擅自清理已有改动。先判断当前工作区是否有用户或其他 Agent 留下的未提交内容。

### 修改后通常运行

```bash
npm run lint
npm run typecheck
npm run build
```

按任务风险补充针对性测试：

```bash
npm run test:link-integrity
npm run test:today-market
npm run test:investment-map
npm run test:full-product
npm run test:secret-scan
```

`npm run test:ai-provider` 会产生真实 API 请求，只有用户明确要求或任务确实需要时才运行。

### 浏览器验证

涉及 UI 时不能只看 lint / typecheck / build。必须实际验证：

- 桌面端；
- 390px 左右移动端；
- 输入、按钮、跳转和刷新；
- 加载、空状态和失败状态；
- 控制台明显错误；
- 是否出现横向溢出；
- 是否影响公网 Demo。

---

## 八、常见任务应该怎么做

### 修 Bug

```text
复现
→ 找到真实失败阶段
→ 保存安全日志证据
→ 最小修复
→ 只回归相关链路
→ 再跑静态检查
```

不要一看到错误就重写 Prompt、Schema 或整个架构。

### 修改 UI

- 保持现有深色、高级、克制、金色强调的 Editorial Financial Technology 视觉；
- 不要重新设计无关页面；
- 优先保留真实产品截图和信息层级；
- 桌面优先，同时必须兼容移动端；
- UI 修改后做真实浏览器检查。

### 修改 Prompt 或内容策略

这是 YELLOW 任务。必须单变量实验，并对同一问题比较 Baseline 和 Candidate。不能因为代码已经写完，就默认 Candidate 应该保留。

### 更换模型、Provider 或搜索 API

这是重大决策。未得到用户明确授权时不要执行。得到授权后优先新增 Adapter 或修改环境配置，避免让页面和 Story Engine 感知厂商差异。

### 新增页面或重大模块

先确认是否符合当前 P0：稳定可用，以及 P1：提高内容质量。登录、支付、会员、数据库和大规模新模块不能自行添加。

---

## 九、禁止事项

- 禁止输出、提交或记录 API Key、Cookie、体验码、Authorization Header 和 `.env.local` 内容；
- 禁止用假数据冒充实时数据；
- 禁止没有执行真实请求却声称 Provider 测试成功；
- 禁止为了速度删除重要财经解释；
- 禁止用术语堆叠代替因果解释；
- 禁止把“官方来源数量为 0”单独当作 Pipeline 失败原因；
- 禁止无限 retry 或无界并发调用付费 API；
- 禁止未授权停止公网 3001、cloudflared 或用户正在使用的服务；
- 禁止覆盖、回滚或删除不属于当前任务的未提交修改；
- 禁止为了“代码更漂亮”重构已经稳定运行的核心链路；
- 禁止把本项目改成荐股、收益承诺或自动交易产品。

---

## 十、推荐的任务指令模板

以后给 Coding Agent 下任务时，可以使用以下模板：

```text
请先阅读：
AGENTS.md
README.md
docs/marketarc/PRODUCT_BRAIN.md
docs/marketarc/CODING_ASSISTANT_ONBOARDING.md

任务目标：
[只写一个明确目标]

允许修改：
[文件或模块范围]

禁止修改：
[Story Engine / Schema / Prompt / Provider / UI 等边界]

必须验证：
[具体用户流程、问题、接口或页面]

完成检查：
npm run lint
npm run typecheck
npm run build

完成后只汇报：
1. Root cause 或实现结果
2. 修改文件
3. 测试证据
4. 剩余风险

不要继续开发任务范围之外的功能。
```

---

## 十一、接管完成的判断标准

新的 Coding Agent 只有在能够正确回答以下问题后，才算真正完成接管：

1. MarketArc 为谁解决什么问题？
2. 为什么它不是财经搜索框或荐股工具？
3. Golden Stories、ResearchBrief、AnalysisStory 和 Story Engine 分别是什么？
4. 真实问题从提交到完整故事经过哪些阶段？
5. Research Provider 与 AI Provider 为什么必须解耦？
6. 哪些数据必须留在项目内部？
7. 哪些 Secret 永远不能输出？
8. 为什么不能随意修改 Prompt、Schema 或恢复模型并发？
9. 修改后应该进行哪些静态检查和浏览器验证？
10. 哪些重大决定必须等待用户授权？

如果回答不清楚，应继续阅读现有文档和代码，而不是开始修改。
