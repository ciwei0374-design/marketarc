function stripJsonFence(content: string) {
  return content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function unwrapEncodedJson(content: string) {
  let candidate = stripJsonFence(content);
  for (let depth = 0; depth < 2 && candidate.startsWith('"'); depth += 1) {
    try {
      const decoded: unknown = JSON.parse(candidate);
      if (typeof decoded !== "string") break;
      candidate = stripJsonFence(decoded);
    } catch {
      break;
    }
  }
  return candidate;
}

export function normalizeModelJson(content: string) {
  let normalized = unwrapEncodedJson(content);
  const start = normalized.indexOf("{");
  const end = normalized.lastIndexOf("}");
  if (start >= 0 && end > start) normalized = normalized.slice(start, end + 1);

  let result = "";
  let inString = false;
  let escaped = false;
  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];
    if (escaped) { result += character; escaped = false; continue; }
    if (character === "\\" && inString) { result += character; escaped = true; continue; }
    if (character === '"') {
      if (inString) {
        let lookahead = index + 1;
        while (lookahead < normalized.length && /\s/.test(normalized[lookahead])) lookahead += 1;
        const next = normalized[lookahead];
        if (next && ![":", ",", "}", "]"].includes(next)) {
          result += '\\"';
          continue;
        }
      }
      result += character;
      inString = !inString;
      continue;
    }
    if (inString && character === "\n") result += "\\n";
    else if (inString && character === "\r") result += "\\r";
    else if (inString && character === "\t") result += "\\t";
    else result += character;
  }
  return result;
}

function parseWithLocalRepairs(content: string) {
  let candidate = content;
  for (let repairCount = 0; repairCount <= 3; repairCount += 1) {
    try {
      return JSON.parse(candidate) as unknown;
    } catch (error) {
      if (!(error instanceof SyntaxError) || repairCount === 3) throw error;
      const match = error.message.match(/position (\d+)/);
      const position = match ? Number(match[1]) : -1;
      if (position < 0) throw error;

      let next = position + 1;
      while (next < candidate.length && /\s/.test(candidate[next])) next += 1;
      if (candidate[position] === "}" && candidate[next] === "]") {
        candidate = candidate.slice(0, position) + "]" + candidate.slice(position);
        continue;
      }

      if (candidate[position] === '"' && candidate[position - 1] === '"' && candidate[position - 2] === "\\") {
        candidate = candidate.slice(0, position - 2) + candidate.slice(position);
        continue;
      }

      throw error;
    }
  }
  throw new SyntaxError("Unable to parse model JSON");
}

function completeJsonObjects(content: string) {
  const text = stripJsonFence(content);
  const candidates: string[] = [];
  for (let start = text.indexOf("{"); start >= 0; start = text.indexOf("{", start + 1)) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < text.length; index += 1) {
      const character = text[index];
      if (escaped) { escaped = false; continue; }
      if (character === "\\" && inString) { escaped = true; continue; }
      if (character === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (character === "{") depth += 1;
      if (character === "}") {
        depth -= 1;
        if (depth === 0) { candidates.push(text.slice(start, index + 1)); break; }
      }
    }
  }
  return candidates.sort((left, right) => right.length - left.length);
}

export function parseModelJson(content: string, accepts?: (value: unknown) => boolean) {
  let originalError: unknown;
  try {
    const value = parseWithLocalRepairs(normalizeModelJson(content));
    if (!accepts || accepts(value)) return value;
    originalError = new SyntaxError("Model JSON object did not match the expected shape");
  } catch (error) {
    originalError = error;
  }
  for (const candidate of completeJsonObjects(content)) {
    try {
      const value = parseWithLocalRepairs(normalizeModelJson(candidate));
      if (!accepts || accepts(value)) return value;
    } catch { /* A smaller, complete object may follow a malformed preamble. */ }
  }
  throw originalError;
}
