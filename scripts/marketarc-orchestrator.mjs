import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { appendFile, mkdir, open, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const PROJECT = process.cwd();
const RUNTIME = path.join(PROJECT, ".marketarc-orchestrator");
const CONTROL = path.join(PROJECT, "docs", "marketarc");
const PATHS = {
  state: path.join(RUNTIME, "state.json"),
  threads: path.join(RUNTIME, "threads.json"),
  heartbeat: path.join(RUNTIME, "heartbeat.json"),
  events: path.join(RUNTIME, "events.jsonl"),
  lock: path.join(RUNTIME, "orchestrator.lock"),
  managerResponse: path.join(RUNTIME, "last-manager-response.json"),
  engineerResponse: path.join(RUNTIME, "last-engineer-response.json"),
  override: path.join(CONTROL, "ORCHESTRATION_OVERRIDE.json"),
  controlState: path.join(CONTROL, "ORCHESTRATION_STATE.json"),
};
const LIMITS = { maxHandoffsPerMission: 20, sameFailureMax: 2, managerParseRetry: 1, engineerFatalRetry: 1 };
const args = new Set(process.argv.slice(2));
const mode = args.has("--dry-run") ? "dry-run" : args.has("--live-handshake") ? "live-handshake" : "normal";
const now = () => new Date().toISOString();
let activeStateForHeartbeat = null;

await mkdir(RUNTIME, { recursive: true });

async function readJson(file, fallback = null) {
  try { return JSON.parse(await readFile(file, "utf8")); } catch { return fallback; }
}

async function atomicJson(file, value) {
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, file);
}

async function event(agent, missionId, taskId, name, result, startedAt = Date.now()) {
  const record = { timestamp: now(), missionId, agent, taskId, event: name, result, duration: Date.now() - startedAt };
  await appendFile(PATHS.events, `${JSON.stringify(record)}\n`, "utf8");
}

function pidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch { return false; }
}

async function acquireLock() {
  try {
    const handle = await open(PATHS.lock, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY);
    await handle.writeFile(JSON.stringify({ pid: process.pid, startedAt: now(), mode }));
    await handle.close();
    return true;
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const existing = await readJson(PATHS.lock, {});
    if (pidAlive(existing.pid)) return false;
    await rm(PATHS.lock, { force: true });
    return acquireLock();
  }
}

async function releaseLock() {
  const existing = await readJson(PATHS.lock, {});
  if (existing.pid === process.pid) await rm(PATHS.lock, { force: true });
}

async function heartbeat(state, status = state.status) {
  await atomicJson(PATHS.heartbeat, {
    status,
    pid: process.pid,
    missionId: state.missionId ?? null,
    currentAgent: state.currentAgent ?? null,
    currentTask: state.currentTask ?? null,
    currentPhase: state.currentPhase ?? null,
    startedAt: state.startedAt,
    lastHeartbeatAt: now(),
    humanActionRequired: Boolean(state.humanActionRequired),
  });
}

async function saveState(state) {
  state.updatedAt = now();
  activeStateForHeartbeat = state;
  await atomicJson(PATHS.state, state);
  await heartbeat(state);
}

async function controlAction(state) {
  if (state?.stopRequested) return { action: "STOP", source: "runtime" };
  const runtime = await readJson(PATHS.state, state);
  if (runtime?.stopRequested) return { action: "STOP", source: "runtime" };
  return await readJson(PATHS.override, { action: "NONE" });
}

function assertOverride(value) {
  const allowed = ["NONE", "PAUSE", "STOP", "CHANGE_PRIORITY", "NEW_INSTRUCTION"];
  if (!value || !allowed.includes(value.action)) throw new Error("INVALID_ORCHESTRATION_OVERRIDE");
  return value;
}

const managerSchema = {
  type: "object", additionalProperties: false,
  required: ["decision", "missionId", "taskId", "phase", "instruction", "acceptanceCriteria", "allowedScope", "forbiddenScope", "reason"],
  properties: {
    decision: { type: "string", enum: ["RUN_ENGINEER", "MISSION_COMPLETE", "BLOCKED", "RED_DECISION_REQUIRED", "PAUSE"] },
    missionId: { type: "string" }, taskId: { type: "string" }, phase: { type: "string" }, instruction: { type: "string" },
    acceptanceCriteria: { type: "array", items: { type: "string" } }, allowedScope: { type: "array", items: { type: "string" } },
    forbiddenScope: { type: "array", items: { type: "string" } }, reason: { type: "string" },
  },
};
const engineerSchema = {
  type: "object", additionalProperties: false,
  required: ["status", "missionId", "taskId", "summary", "evidence", "filesModified", "businessCodeChanged"],
  properties: {
    status: { type: "string", enum: ["PASS", "FAIL", "BLOCKED"] }, missionId: { type: "string" }, taskId: { type: "string" },
    summary: { type: "string" }, evidence: { type: "array", items: { type: "string" } }, filesModified: { type: "array", items: { type: "string" } },
    businessCodeChanged: { type: "boolean" },
  },
};

async function ensureSchemaFiles() {
  const manager = path.join(RUNTIME, "manager-decision.schema.json");
  const engineer = path.join(RUNTIME, "engineer-result.schema.json");
  await atomicJson(manager, managerSchema);
  await atomicJson(engineer, engineerSchema);
  return { manager, engineer };
}

function findThreadId(value) {
  if (!value || typeof value !== "object") return null;
  if (typeof value.thread_id === "string") return value.thread_id;
  if (typeof value.threadId === "string") return value.threadId;
  for (const nested of Object.values(value)) {
    const found = findThreadId(nested);
    if (found) return found;
  }
  return null;
}

async function runProcess(command, processArgs, timeoutMs = 8 * 60_000) {
  return await new Promise((resolve, reject) => {
    const childEnv = { ...process.env };
    if (process.platform === "win32" && !childEnv.CODEX_HOME && childEnv.USERPROFILE) {
      childEnv.CODEX_HOME = path.join(childEnv.USERPROFILE, ".codex");
    }
    const child = spawn(command, processArgs, { cwd: PROJECT, windowsHide: true, shell: false, env: childEnv });
    child.stdin.end();
    let stdout = ""; let stderr = ""; let settled = false;
    const heartbeatTimer = setInterval(() => { if (activeStateForHeartbeat) void heartbeat(activeStateForHeartbeat); }, 10_000);
    const timer = setTimeout(() => { if (!settled) child.kill(); reject(new Error("CODEX_AGENT_TIMEOUT")); }, timeoutMs);
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", (error) => { settled = true; clearTimeout(timer); clearInterval(heartbeatTimer); reject(error); });
    child.on("close", (code) => {
      settled = true; clearTimeout(timer); clearInterval(heartbeatTimer);
      if (code !== 0) reject(new Error(`CODEX_AGENT_EXIT_${code}: ${stderr.slice(-500)}`));
      else resolve({ stdout, stderr });
    });
  });
}

async function runCodex(role, prompt, threadId, schemaPath, outputPath) {
  const command = process.platform === "win32" ? process.execPath : "codex";
  const launcher = process.platform === "win32"
    ? [path.join(process.env.APPDATA ?? "", "npm", "node_modules", "@openai", "codex", "bin", "codex.js")]
    : [];
  const sandbox = role === "manager" ? "read-only" : "workspace-write";
  const reasoningEffort = process.env.MARKETARC_ORCHESTRATOR_REASONING_EFFORT?.trim() || "low";
  const globalArgs = ["-c", `model_reasoning_effort=\"${reasoningEffort}\"`];
  const processArgs = threadId
    ? [...globalArgs, "exec", "resume", "--json", "--output-schema", schemaPath, "-o", outputPath, threadId, prompt]
    : [...globalArgs, "--sandbox", sandbox, "-a", "never", "--cd", PROJECT, "exec", "--json", "--output-schema", schemaPath, "-o", outputPath, prompt];
  const { stdout } = await runProcess(command, [...launcher, ...processArgs]);
  const events = stdout.split(/\r?\n/).filter(Boolean).flatMap((line) => { try { return [JSON.parse(line)]; } catch { return []; } });
  const response = JSON.parse(await readFile(outputPath, "utf8"));
  return { response, threadId: threadId ?? events.map(findThreadId).find(Boolean) ?? null };
}

function managerPrompt(mission, engineerResult = null, override = null) {
  return `You are AUTO MANAGER for MarketArc. You are read-only. Read docs/marketarc/PRODUCT_BRAIN.md, DELIVERY_REPORT_V1.md, ORCHESTRATION_STATE.json, AUTONOMY_POLICY.md, and DECISION_QUEUE.md.\nMission: ${JSON.stringify(mission)}\nEngineer result: ${JSON.stringify(engineerResult)}\nHuman override: ${JSON.stringify(override)}\nReturn only the required structured Manager Decision. Do not edit files. For the live handshake, first assign exactly one read-only verification to Engineer; after a PASS result, return MISSION_COMPLETE.`;
}

function engineerPrompt(decision, readOnlyVerification = false) {
  const scopeRule = readOnlyVerification
    ? "This is a read-only verification: do not modify business code or any project file and do not call Kimi/Tavily."
    : "You may use workspace-write only within allowedScope. Preserve uncommitted user work, obey forbiddenScope, and run the stated acceptance checks.";
  return `You are AUTO ENGINEER for MarketArc. Follow this Manager Decision exactly: ${JSON.stringify(decision)}\n${scopeRule} Never touch port 3001 or cloudflared. Return only the required structured Engineer Result.`;
}

function validateManager(value) {
  if (!value || !managerSchema.properties.decision.enum.includes(value.decision)) throw new Error("MANAGER_DECISION_PARSE_FAILED");
  for (const key of managerSchema.required) if (!(key in value)) throw new Error(`MANAGER_DECISION_MISSING_${key}`);
  return value;
}

function recoveryNextAgent(state) {
  if (state.lastEngineerResult && state.status === "RUNNING") return "manager";
  if (state.lastManagerDecision?.decision === "RUN_ENGINEER") return "engineer";
  return "manager";
}

async function dryRun() {
  const missionId = "marketarc-orchestrator-dry-run-v1";
  const state = { version: 1, mode, status: "RUNNING", missionId, currentTask: "dry-run", currentPhase: "HANDSHAKE", currentAgent: "manager", startedAt: now(), handoffs: 0, completedTaskIds: [], humanActionRequired: false, stopRequested: false };
  const threads = { managerThreadId: "mock-manager-thread", engineerThreadId: "mock-engineer-thread", updatedAt: now() };
  await atomicJson(PATHS.threads, threads); await saveState(state);
  const secondLockRejected = !(await acquireLock());
  if (!secondLockRejected) throw new Error("DRY_RUN_LOCK_FAILED");
  assertOverride({ action: "PAUSE" }); assertOverride({ action: "STOP" }); assertOverride({ action: "NONE" });
  const first = validateManager({ decision: "RUN_ENGINEER", missionId, taskId: "read-only-check", phase: "DRY_RUN", instruction: "Mock verification", acceptanceCriteria: ["PASS"], allowedScope: ["mock"], forbiddenScope: ["business code"], reason: "Validate wake path" });
  state.lastManagerDecision = first; state.currentAgent = "engineer"; state.handoffs += 1; await saveState(state); await event("manager", missionId, first.taskId, "decision", first.decision);
  const engineer = { status: "PASS", missionId, taskId: first.taskId, summary: "Mock verification passed", evidence: ["read-only"], filesModified: [], businessCodeChanged: false };
  state.lastEngineerResult = engineer; state.completedTaskIds.push(first.taskId); state.currentAgent = "manager"; state.handoffs += 1; await atomicJson(PATHS.engineerResponse, engineer); await saveState(state); await event("engineer", missionId, first.taskId, "result", engineer.status);
  const final = validateManager({ decision: "MISSION_COMPLETE", missionId, taskId: first.taskId, phase: "DRY_RUN", instruction: "Stop", acceptanceCriteria: ["PASS"], allowedScope: [], forbiddenScope: ["new mission"], reason: "Mock Engineer passed" });
  state.lastManagerDecision = final; state.status = "AUTOMATION_READY"; state.currentAgent = null; state.currentTask = "WAITING_FOR_NEXT_MANAGER_MISSION"; state.handoffs += 1; await atomicJson(PATHS.managerResponse, final); await saveState(state); await event("manager", missionId, first.taskId, "review", final.decision);
  if (recoveryNextAgent({ status: "RUNNING", lastEngineerResult: engineer }) !== "manager") throw new Error("DRY_RUN_CRASH_RECOVERY_FAILED");
  const stopState = { ...state, stopRequested: true };
  if ((await controlAction(stopState)).action !== "STOP") throw new Error("DRY_RUN_STOP_FAILED");
  console.log("MARKETARC_ORCHESTRATOR_DRY_RUN_PASS");
}

async function liveHandshake() {
  const schemas = await ensureSchemaFiles();
  const missionId = `marketarc-live-handshake-${Date.now()}`;
  const mission = { id: missionId, status: "ACTIVE", scope: "READ_ONLY_VERIFICATION", objective: "Verify DELIVERY_REPORT_V1 exists and ORCHESTRATION_STATE marks the prior mission complete; do not modify files." };
  const state = { version: 1, mode, status: "RUNNING", missionId, currentTask: "manager-planning", currentPhase: "LIVE_HANDSHAKE", currentAgent: "manager", startedAt: now(), handoffs: 0, completedTaskIds: [], humanActionRequired: false, stopRequested: false };
  let threads = await readJson(PATHS.threads, { managerThreadId: null, engineerThreadId: null });
  if (threads.managerThreadId?.startsWith("mock-")) threads.managerThreadId = null;
  if (threads.engineerThreadId?.startsWith("mock-")) threads.engineerThreadId = null;
  await saveState(state);
  const override = assertOverride(await readJson(PATHS.override, { action: "NONE" }));
  if (["STOP", "PAUSE"].includes(override.action)) throw new Error(`HANDSHAKE_${override.action}`);
  const managerStarted = Date.now();
  let managerTurn = await runCodex("manager", managerPrompt(mission, null, override), threads.managerThreadId, schemas.manager, PATHS.managerResponse);
  threads.managerThreadId = managerTurn.threadId; threads.updatedAt = now(); await atomicJson(PATHS.threads, threads);
  let decision;
  try { decision = validateManager(managerTurn.response); }
  catch {
    managerTurn = await runCodex("manager", "Your previous response was invalid. Return only a valid Manager Decision matching the required schema.", threads.managerThreadId, schemas.manager, PATHS.managerResponse);
    decision = validateManager(managerTurn.response);
  }
  await event("manager", missionId, decision.taskId, "decision", decision.decision, managerStarted);
  if (decision.decision !== "RUN_ENGINEER") throw new Error(`HANDSHAKE_MANAGER_EXPECTED_RUN_ENGINEER_GOT_${decision.decision}`);
  state.lastManagerDecision = decision; state.currentAgent = "engineer"; state.currentTask = decision.taskId; state.handoffs += 1; await saveState(state);
  const beforeEngineer = assertOverride(await readJson(PATHS.override, { action: "NONE" }));
  if (["STOP", "PAUSE"].includes(beforeEngineer.action)) throw new Error(`HANDSHAKE_${beforeEngineer.action}`);
  const engineerStarted = Date.now();
  const engineerTurn = await runCodex("engineer", engineerPrompt(decision, true), threads.engineerThreadId, schemas.engineer, PATHS.engineerResponse);
  threads.engineerThreadId = engineerTurn.threadId; threads.updatedAt = now(); await atomicJson(PATHS.threads, threads);
  const engineer = engineerTurn.response;
  if (!engineer || !["PASS", "FAIL", "BLOCKED"].includes(engineer.status)) throw new Error("ENGINEER_RESULT_PARSE_FAILED");
  await event("engineer", missionId, decision.taskId, "result", engineer.status, engineerStarted);
  state.lastEngineerResult = engineer; state.currentAgent = "manager"; state.handoffs += 1; if (engineer.status === "PASS") state.completedTaskIds.push(decision.taskId); await saveState(state);
  const beforeReview = assertOverride(await readJson(PATHS.override, { action: "NONE" }));
  if (["STOP", "PAUSE"].includes(beforeReview.action)) throw new Error(`HANDSHAKE_${beforeReview.action}`);
  const reviewStarted = Date.now();
  const reviewTurn = await runCodex("manager", managerPrompt(mission, engineer, beforeReview), threads.managerThreadId, schemas.manager, PATHS.managerResponse);
  const review = validateManager(reviewTurn.response);
  await event("manager", missionId, review.taskId, "review", review.decision, reviewStarted);
  if (engineer.status !== "PASS" || review.decision !== "MISSION_COMPLETE") throw new Error("HANDSHAKE_REVIEW_FAILED");
  state.lastManagerDecision = review; state.status = "AUTOMATION_READY"; state.currentAgent = null; state.currentTask = "WAITING_FOR_NEXT_MANAGER_MISSION"; state.handoffs += 1; await saveState(state);
  console.log("MARKETARC AUTO WAKE: PASS");
}

async function normalStart() {
  const schemas = await ensureSchemaFiles();
  let state = await readJson(PATHS.state, null) ?? { version: 1, mode, startedAt: now(), handoffs: 0, completedTaskIds: [], humanActionRequired: false, stopRequested: false };
  state.stopRequested = false;
  await saveState(state);
  console.log("MARKETARC_ORCHESTRATOR_WAITING_FOR_NEXT_MANAGER_MISSION");
  while (true) {
    const action = assertOverride(await controlAction(state));
    if (action.action === "STOP") { state.status = "STOPPED"; state.currentAgent = null; await saveState(state); return; }
    if (action.action === "PAUSE") { state.status = "PAUSED"; state.currentAgent = null; await saveState(state); return; }
    const control = await readJson(PATHS.controlState, {});
    if (control?.mission?.status !== "ACTIVE") {
      Object.assign(state, { status: "AUTOMATION_READY", missionId: null, currentAgent: null, currentTask: "WAITING_FOR_NEXT_MANAGER_MISSION", currentPhase: null, humanActionRequired: false });
      await saveState(state);
      await new Promise((resolve) => setTimeout(resolve, 5_000));
      state = await readJson(PATHS.state, state);
      continue;
    }

    const mission = control.mission;
    if (state.missionId !== mission.id) {
      state = { version: 1, mode, status: "RUNNING", missionId: mission.id, currentAgent: "manager", currentTask: "manager-planning", currentPhase: control.currentPhase ?? "MISSION", startedAt: now(), handoffs: 0, completedTaskIds: [], humanActionRequired: false, stopRequested: false, sameFailureCount: 0 };
    }
    let threads = await readJson(PATHS.threads, { managerThreadId: null, engineerThreadId: null });
    while (state.status === "RUNNING") {
      if (state.handoffs >= LIMITS.maxHandoffsPerMission) {
        Object.assign(state, { status: "BLOCKED", humanActionRequired: true, safeError: "MAX_HANDOFFS_REACHED" }); await saveState(state); break;
      }
      const switchAction = assertOverride(await controlAction(state));
      if (switchAction.action === "STOP" || switchAction.action === "PAUSE") {
        state.status = switchAction.action === "STOP" ? "STOPPED" : "PAUSED"; state.currentAgent = null; await saveState(state); return;
      }
      const nextAgent = state.currentAgent ?? recoveryNextAgent(state);
      if (nextAgent === "manager") {
        let turn;
        try {
          turn = await runCodex("manager", managerPrompt(mission, state.lastEngineerResult ?? null, switchAction), threads.managerThreadId, schemas.manager, PATHS.managerResponse);
          threads.managerThreadId = turn.threadId; threads.updatedAt = now(); await atomicJson(PATHS.threads, threads);
          turn.response = validateManager(turn.response);
        } catch (error) {
          if (!threads.managerThreadId) throw error;
          turn = await runCodex("manager", "Return only a valid Manager Decision matching the required schema. Do not guess or edit files.", threads.managerThreadId, schemas.manager, PATHS.managerResponse);
          turn.response = validateManager(turn.response);
        }
        const decision = turn.response; state.lastManagerDecision = decision; state.handoffs += 1;
        await event("manager", mission.id, decision.taskId, "decision", decision.decision);
        if (decision.decision === "RUN_ENGINEER") {
          state.currentAgent = "engineer"; state.currentTask = decision.taskId; await saveState(state); continue;
        }
        if (decision.decision === "MISSION_COMPLETE") Object.assign(state, { status: "AUTOMATION_READY", currentAgent: null, currentTask: "WAITING_FOR_NEXT_MANAGER_MISSION" });
        else Object.assign(state, { status: decision.decision, currentAgent: null, humanActionRequired: ["BLOCKED", "RED_DECISION_REQUIRED"].includes(decision.decision) });
        await saveState(state); break;
      }

      const decision = state.lastManagerDecision;
      if (!decision || decision.decision !== "RUN_ENGINEER") throw new Error("ENGINEER_WITHOUT_MANAGER_DECISION");
      if (state.completedTaskIds.includes(decision.taskId)) { state.currentAgent = "manager"; await saveState(state); continue; }
      let engineerTurn;
      try {
        engineerTurn = await runCodex("engineer", engineerPrompt(decision), threads.engineerThreadId, schemas.engineer, PATHS.engineerResponse);
      } catch (error) {
        if ((state.engineerFatalRetries ?? 0) >= LIMITS.engineerFatalRetry) throw error;
        state.engineerFatalRetries = (state.engineerFatalRetries ?? 0) + 1;
        engineerTurn = await runCodex("engineer", engineerPrompt(decision), threads.engineerThreadId, schemas.engineer, PATHS.engineerResponse);
      }
      threads.engineerThreadId = engineerTurn.threadId; threads.updatedAt = now(); await atomicJson(PATHS.threads, threads);
      const result = engineerTurn.response;
      if (!result || !["PASS", "FAIL", "BLOCKED"].includes(result.status)) throw new Error("ENGINEER_RESULT_PARSE_FAILED");
      const failureSignature = result.status === "PASS" ? null : `${result.status}:${result.summary}`;
      state.sameFailureCount = failureSignature && state.lastFailureSignature === failureSignature ? (state.sameFailureCount ?? 0) + 1 : failureSignature ? 1 : 0;
      state.lastFailureSignature = failureSignature; state.lastEngineerResult = result; state.handoffs += 1; state.currentAgent = "manager";
      if (result.status === "PASS") state.completedTaskIds.push(decision.taskId);
      if (state.sameFailureCount >= LIMITS.sameFailureMax) Object.assign(state, { status: "BLOCKED", currentAgent: null, humanActionRequired: true, safeError: "SAME_FAILURE_LIMIT_REACHED" });
      await event("engineer", mission.id, decision.taskId, "result", result.status); await saveState(state);
    }
    if (["BLOCKED", "RED_DECISION_REQUIRED", "PAUSED", "STOPPED"].includes(state.status)) return;
  }
}

if (!(await acquireLock())) {
  console.log("MARKETARC_ORCHESTRATOR_ALREADY_RUNNING");
  process.exit(2);
}

try {
  if (mode === "dry-run") await dryRun();
  else if (mode === "live-handshake") await liveHandshake();
  else await normalStart();
} catch (error) {
  const state = await readJson(PATHS.state, { startedAt: now() });
  Object.assign(state, { status: "BLOCKED", currentAgent: null, humanActionRequired: true, safeError: error instanceof Error ? error.message : String(error) });
  await saveState(state);
  await event("orchestrator", state.missionId ?? null, state.currentTask ?? null, "fatal", state.safeError);
  console.error("MARKETARC_ORCHESTRATOR_FAILED", state.safeError);
  process.exitCode = 1;
} finally {
  await releaseLock();
}
