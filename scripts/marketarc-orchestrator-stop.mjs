import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const runtime = path.join(process.cwd(), ".marketarc-orchestrator");
const statePath = path.join(runtime, "state.json");
await mkdir(runtime, { recursive: true });
let state = {};
try { state = JSON.parse(await readFile(statePath, "utf8")); } catch {}
state.stopRequested = true;
state.stopRequestedAt = new Date().toISOString();
const temporary = `${statePath}.${process.pid}.tmp`;
await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, "utf8");
await rename(temporary, statePath);
console.log("MARKETARC_ORCHESTRATOR_STOP_REQUESTED");
