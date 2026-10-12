# 资见 AI 长期开发规则

- 所有业务数据必须位于项目根目录内部。
- 默认数据目录为 `/data`。
- 不允许删除已有功能，除非用户明确要求。
- 修改功能前先理解现有代码。
- 每次修改尽量小步进行。
- 每次重大修改后运行检查。
- 不允许把 API Key 写入源码。
- 页面优先保证桌面端体验，同时兼容移动端。
- 产品定位为新手友好的 AI 投研教育平台。
- 不提供确定性荐股、收益保证或自动交易功能。
- 中文为主要界面语言。
- 所有新的架构决定记录在 `README.md`。
- 保持代码结构简单，优先支持快速 Vibe Coding。
- 执行 MarketArc Nightly 前，必须依次读取 `docs/marketarc/01_PRODUCT_PRINCIPLES.md`、`AUTONOMY_POLICY.md`、`CHATGPT_INSTRUCTIONS.md` 和 `DECISION_QUEUE.md`。
- 自动测试不得停止、重启或占用公网 Demo 的 3001 服务；隔离测试优先使用 3101。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
