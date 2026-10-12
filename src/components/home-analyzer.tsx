"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const examples = ["美联储为什么降息？", "黄金为什么持续上涨？", "AI 为什么会带动电力需求？"];
const normalizedExamples = new Set(examples.map((example) => normalizeQuestion(example)));
const loadingStages = [
  "正在查找可靠信息…",
  "正在梳理关键事实…",
  "正在拆解因果关系…",
  "正在生成财经故事…",
];

function normalizeQuestion(value: string) {
  return value.replace(/[？?。！!\s]/g, "").toUpperCase();
}

export function HomeAnalyzer() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);

  function chooseExample(example: string) {
    setQuestion(example);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = question.trim();
    if (!value) {
      setError("请输入一个你想看懂的财经问题。");
      return;
    }
    setError("");
    setIsLoading(true);
    setLoadingStage(0);

    if (normalizedExamples.has(normalizeQuestion(value))) {
      window.setTimeout(() => router.push(`/analysis?q=${encodeURIComponent(value)}`), 1000);
      return;
    }

    const stageTimer = window.setInterval(() => {
      setLoadingStage((current) => Math.min(current + 1, loadingStages.length - 1));
    }, 1800);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: value }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(payload?.message || "这次研究没有成功完成。你可以重新尝试。");
      }
      const payload = (await response.json()) as { jobId?: string };
      if (!payload.jobId) throw new Error("研究任务创建失败，请重新尝试。");
      router.push(`/analysis/job/${encodeURIComponent(payload.jobId)}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "这次研究没有成功完成。你可以重新尝试。");
      setIsLoading(false);
    } finally {
      window.clearInterval(stageTimer);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-3xl text-left sm:mt-14">
      <form onSubmit={handleSubmit}>
        <div className={`analysis-input-shell ${error ? "has-error" : ""}`}>
          <input
            id="question"
            name="question"
            type="text"
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              if (error) setError("");
            }}
            disabled={isLoading}
            aria-describedby={error ? "question-error" : undefined}
            aria-invalid={Boolean(error)}
            placeholder="输入一条财经新闻、政策、公司或你想看懂的问题……"
            className="w-full bg-transparent px-5 py-5 text-[15px] text-white outline-none placeholder:text-zinc-600 disabled:cursor-wait sm:px-6 sm:py-6 sm:text-base"
          />
          <button type="submit" disabled={isLoading} className="m-2.5 flex shrink-0 items-center justify-center rounded-xl bg-gold px-5 py-3.5 text-sm font-semibold text-zinc-950 transition hover:bg-[#e5c678] disabled:cursor-wait disabled:opacity-80 sm:px-7">
            {isLoading ? <span className="loading-dot" aria-hidden="true" /> : null}
            {isLoading ? "分析中" : "开始分析"}
          </button>
        </div>
        <div className="mt-3 min-h-6 px-1">
          {error ? <p id="question-error" role="alert" className="text-sm text-red-400">{error}</p> : null}
          {isLoading ? <p role="status" className="text-sm text-gold">{loadingStages[loadingStage]}</p> : null}
        </div>
      </form>
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <span className="mr-1 text-xs text-zinc-600">试试看：</span>
        {examples.map((example) => (
          <button key={example} type="button" disabled={isLoading} onClick={() => chooseExample(example)} className="rounded-full border border-white/[0.09] bg-white/[0.025] px-3.5 py-2 text-xs text-zinc-400 transition hover:border-gold/30 hover:text-zinc-200 disabled:cursor-wait">
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
