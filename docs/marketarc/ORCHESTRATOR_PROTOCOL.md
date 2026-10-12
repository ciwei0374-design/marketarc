# MarketArc Local Orchestrator Protocol V1

## Purpose

The local orchestrator runs two independent persistent Codex CLI sessions: **AUTO MANAGER** and **AUTO ENGINEER**. It performs Manager → Engineer → Manager handoffs without UI automation or an additional Human message.

The current product mission is complete. The initial runtime state is `AUTOMATION_READY / WAITING_FOR_NEXT_MANAGER_MISSION`; starting the orchestrator does not replay `STABILIZE_POLISH_EXPAND_V1`.

## Runtime

All volatile state lives in the gitignored project-local directory `.marketarc-orchestrator/`:

- `state.json`
- `threads.json`
- `heartbeat.json`
- `events.jsonl`
- `orchestrator.lock`
- `last-manager-response.json`
- `last-engineer-response.json`

No secret or environment value may be written there. Agent prompts identify files and scope but never include `.env.local`, API keys, cookies, or authorization headers.

## Agent Execution

- Manager: `codex exec --json --sandbox read-only --ask-for-approval never`.
- Engineer: `codex exec --json --sandbox workspace-write --ask-for-approval never`.
- New sessions are created once and their IDs are stored in `threads.json`.
- Later turns use the official `codex exec resume <SESSION_ID>` command.
- Orchestrator turns default to low reasoning effort for bounded control-plane work; `MARKETARC_ORCHESTRATOR_REASONING_EFFORT` can change this without changing the product AI Provider or model.
- A parse failure receives one Manager retry in the same Manager thread. A second failure stops safely.

## Manager Decision Contract

Valid decisions are `RUN_ENGINEER`, `MISSION_COMPLETE`, `BLOCKED`, `RED_DECISION_REQUIRED`, and `PAUSE`. Every response must include `missionId`, `taskId`, `phase`, `instruction`, acceptance/allowed/forbidden arrays, and a reason.

## Control and Safety

Before every agent switch the orchestrator reads `ORCHESTRATION_OVERRIDE.json`:

- `NONE`: continue.
- `PAUSE`: finish the current atomic agent turn, persist state, then pause.
- `STOP`: finish the current atomic agent turn, persist state, then stop.
- `CHANGE_PRIORITY` or `NEW_INSTRUCTION`: route the instruction to Manager before Engineer runs.

The runtime stop command also sets a local safe-stop request. It does not kill an active Codex process.

Limits:

- `maxHandoffsPerMission`: 20
- `sameFailureMax`: 2
- `managerParseRetry`: 1
- `engineerFatalRetry`: 1

Single-instance protection uses an atomic lock file. A stale lock is recovered only when its recorded PID is no longer alive.

## Commands

```powershell
npm run marketarc:orchestrator
npm run marketarc:orchestrator:status
npm run marketarc:orchestrator:stop
npm run marketarc:orchestrator:dry-run
npm run marketarc:orchestrator:live-handshake
```

Background start:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-marketarc-orchestrator.ps1
```

## Monitor Contract

Monitor remains strictly read-only. It may read `heartbeat.json`, `events.jsonl`, `state.json`, and the tracked Control Plane, but it must not write overrides, launch agents, or stop the orchestrator.

## Crash Recovery

Every transition is written atomically. On restart, the orchestrator loads `state.json` and `threads.json`; completed `taskId` values are not rerun. A state left after Engineer completion resumes at Manager review. An active stale lock is removed only after PID liveness verification.
