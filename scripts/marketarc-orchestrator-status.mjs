import { readFile } from "node:fs/promises";
import path from "node:path";

const runtime = path.join(process.cwd(), ".marketarc-orchestrator");
async function readJson(name) {
  try { return JSON.parse(await readFile(path.join(runtime, name), "utf8")); }
  catch { return null; }
}

const [state, heartbeat, threads] = await Promise.all([
  readJson("state.json"), readJson("heartbeat.json"), readJson("threads.json"),
]);

console.log(JSON.stringify({ state, heartbeat, threads: threads ? {
  managerThreadId: threads.managerThreadId ?? null,
  engineerThreadId: threads.engineerThreadId ?? null,
  managerPersistent: Boolean(threads.managerThreadId),
  engineerPersistent: Boolean(threads.engineerThreadId),
} : null }, null, 2));
