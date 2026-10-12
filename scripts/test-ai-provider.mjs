import OpenAI from "openai";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const baseURL = process.env.AI_BASE_URL?.trim();
const apiKey = process.env.AI_API_KEY?.trim();
const model = process.env.AI_MODEL?.trim();

function fail(message) {
  console.error(`Provider test failed: ${message}`);
  process.exitCode = 1;
}

if (!baseURL || !apiKey || !model) {
  console.log(`AI_BASE_URL: ${baseURL ? "configured" : "missing"}`);
  console.log(`AI_API_KEY: ${apiKey ? "configured" : "missing"}`);
  console.log(`AI_MODEL: ${model ? "configured" : "missing"}`);
  fail("请先在 .env.local 配置 AI_BASE_URL、AI_API_KEY 和 AI_MODEL。未发起网络请求。");
} else {
  console.log("AI_BASE_URL: configured");
  console.log("AI_API_KEY: configured");
  console.log("AI_MODEL: configured");
  const client = new OpenAI({ apiKey, baseURL, timeout: 30_000, maxRetries: 0 });
  try {
    const models = await client.models.list();
    if (!models.data.some((item) => item.id === model)) throw new Error(`模型列表中没有找到 ${model}`);
    console.log(`Models endpoint: OK (${model})`);

    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: "请只回答：连接成功" }],
      max_tokens: 512,
      thinking: { type: "disabled" },
    });
    const content = completion.choices[0]?.message.content?.trim();
    if (!content?.includes("连接成功") || completion.choices[0]?.finish_reason !== "stop") {
      throw new Error("chat/completions 未完整返回连接确认");
    }
    console.log("Chat endpoint: OK");
    console.log("API Key authentication: OK");
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : String(error);
    const safeMessage = rawMessage.replaceAll(apiKey, "[REDACTED]");
    const status = error && typeof error === "object" && "status" in error ? error.status : "unavailable";
    const type = error instanceof Error ? error.name : typeof error;
    console.error(`HTTP status: ${status}`);
    console.error(`Error type: ${type}`);
    fail(safeMessage);
  }
}
