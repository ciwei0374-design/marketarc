import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const roots = ["src", "scripts", "docs", "README.md", "package.json", ".env.example"];
const ignored = new Set(["node_modules", ".next", ".git", "nightly-worktree-v02", ".worktrees"]);
const fileExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".mts", ".md", ".json", ".example"]);
const detectors = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/,
  /\bAIza[0-9A-Za-z_-]{25,}\b/,
  /(?:API_KEY|SECRET|ACCESS_CODE)\s*[:=]\s*["'][^"'\s]{12,}["']/i,
];

async function filesAt(target) {
  const stat = await import("node:fs/promises").then(({ stat }) => stat(target));
  if (stat.isFile()) return [target];
  const files = [];
  for (const entry of await readdir(target, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    if (entry.name === "secret-scan.mjs") continue;
    const child = path.join(target, entry.name);
    if (entry.isDirectory()) files.push(...await filesAt(child));
    else if (fileExtensions.has(path.extname(entry.name))) files.push(child);
  }
  return files;
}

const files = (await Promise.all(roots.map((root) => filesAt(root)))).flat();
const flagged = [];
for (const file of files) {
  const content = await readFile(file, "utf8");
  if (detectors.some((pattern) => pattern.test(content))) flagged.push(file.replaceAll("\\", "/"));
}
if (flagged.length) {
  console.error(JSON.stringify({ status: "FAIL", flaggedFiles: flagged, secretValuesPrinted: false }));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ status: "PASS", filesScanned: files.length, secretValuesPrinted: false }));
}
