"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisJob, AnalysisJobStatus } from "@/types/analysis-job";
import type { AnalysisStory as AnalysisStoryData } from "@/types/analysis";
import { AnalysisStory } from "@/components/analysis-story/analysis-story";
import { AnalysisHero } from "@/components/analysis-story/analysis-hero";
import { AnalogySection, BackgroundSection } from "@/components/analysis-story/analogy-section";
import { InsightSection } from "@/components/analysis-story/insight-section";
import { EvidenceSection } from "@/components/analysis-story/evidence-watchlist";
import { SiteHeader } from "@/components/site-header";

const stages: Array<{ label: string; active: AnalysisJobStatus[]; completeAt: AnalysisJobStatus[] }> = [
  { label: "正在规划研究方向", active: ["queued", "researching"], completeAt: ["analyzing", "story_a", "story_b", "complete"] },
  { label: "已完成资料检索", active: ["researching"], completeAt: ["analyzing", "story_a", "story_b", "complete"] },
  { label: "正在梳理关键事实", active: ["analyzing"], completeAt: ["story_a", "story_b", "complete"] },
  { label: "正在拆解经济逻辑", active: ["story_a"], completeAt: ["story_b", "complete"] },
  { label: "正在组织财经故事", active: ["story_a"], completeAt: ["story_b", "complete"] },
  { label: "正在分析市场预期与风险", active: ["story_b"], completeAt: ["complete"] },
];

function ResearchProgress({ status }: { status: AnalysisJobStatus }) {
  return (
    <div className="mt-10 grid gap-3">
      {stages.map((stage) => {
        const complete = stage.completeAt.includes(status);
        const active = stage.active.includes(status);
        return (
          <div key={stage.label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${complete ? "border-gold/20 bg-gold/[0.05] text-zinc-200" : active ? "border-white/15 bg-white/[0.04] text-white" : "border-white/[0.06] text-zinc-600"}`}>
            <span className={complete ? "text-gold" : active ? "text-gold animate-pulse" : "text-zinc-700"}>{complete ? "✓" : active ? "●" : "○"}</span>
            {stage.label}
          </div>
        );
      })}
    </div>
  );
}

function WaitingNotice({ elapsedSeconds, stageElapsedSeconds, pollError }: { elapsedSeconds: number; stageElapsedSeconds: number; pollError: boolean }) {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = String(elapsedSeconds % 60).padStart(2, "0");
  const stageMinutes = Math.floor(stageElapsedSeconds / 60);
  const stageSeconds = String(stageElapsedSeconds % 60).padStart(2, "0");
  return (
    <div className="mt-5 text-sm leading-6 text-zinc-400" role="status" aria-live="polite">
      <p>总等待 {minutes}:{seconds} · 当前步骤 {stageMinutes}:{stageSeconds} · 完成后会自动显示结果。</p>
      {elapsedSeconds >= 90 ? <p className="mt-1 text-amber-200/80">这一步比预期更久，可能正在等待外部模型服务响应。</p> : null}
      {pollError ? <p className="mt-1 text-amber-200/80">状态连接暂时中断，正在重新连接；请稍后刷新此页面核对任务状态。</p> : null}
    </div>
  );
}

function QuickTake({ job }: { job: AnalysisJob }) {
  if (!job.researchBrief) return null;
  return (
    <section className="mt-10 rounded-3xl border border-gold/20 bg-gold/[0.045] p-6 sm:p-8">
      <p className="story-kicker">QUICK TAKE · 研究速览</p>
      {job.researchSummary ? <p className="mt-3 text-sm text-zinc-500">资料检索完成 · {job.researchSummary.sources} 个来源 · {job.researchSummary.primary} 个一手来源</p> : null}
      {job.researchSummary?.primary === 0 ? <p className="mt-2 text-sm leading-6 text-amber-200/80">本次未取得一手来源，当前行情与精确数字尚不能视为已核实。</p> : null}
      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white">{job.researchBrief.thesis}</h2>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {job.researchBrief.whatHappened.map((fact) => <p key={fact} className="rounded-xl border border-white/[0.08] bg-black/20 p-4 text-sm leading-6 text-zinc-300">{fact}</p>)}
      </div>
      <div className="mt-7 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
        {job.researchBrief.causalChain.map((item, index) => <span className="contents" key={`${item}-${index}`}><span className="rounded-full border border-white/10 px-3 py-2">{item}</span>{index < job.researchBrief!.causalChain.length - 1 ? <span className="text-gold/60">→</span> : null}</span>)}
      </div>
    </section>
  );
}

export function AnalysisJobView({ initialJob }: { initialJob: AnalysisJob }) {
  const router = useRouter();
  const [job, setJob] = useState(initialJob);
  const [retrying, setRetrying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pollError, setPollError] = useState(false);
  const stageElapsedSeconds = Math.max(0, elapsedSeconds - Math.floor((Date.parse(job.updatedAt) - Date.parse(job.createdAt)) / 1000));

  useEffect(() => {
    const updateElapsed = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - Date.parse(job.createdAt)) / 1000)));
    updateElapsed();
    const clock = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(clock);
  }, [job.createdAt]);

  useEffect(() => {
    if (job.status === "complete" || job.status === "failed") return;
    let polling = false;
    const timer = window.setInterval(async () => {
      if (polling) return;
      polling = true;
      try {
        const response = await fetch(`/api/analyze/status?id=${encodeURIComponent(job.id)}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Status request failed");
        setJob(await response.json() as AnalysisJob);
        setPollError(false);
      } catch {
        setPollError(true);
      } finally {
        polling = false;
      }
    }, 1800);
    return () => window.clearInterval(timer);
  }, [job.id, job.status]);

  async function retry() {
    setRetrying(true);
    try {
      const response = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: job.question }) });
      const payload = await response.json() as { jobId?: string };
      if (response.ok && payload.jobId) router.replace(`/analysis/job/${encodeURIComponent(payload.jobId)}`);
      else setRetrying(false);
    } catch {
      setRetrying(false);
    }
  }

  if (job.status === "complete" && job.analysisStory) return <AnalysisStory story={job.analysisStory} />;

  if (job.partialStoryA) {
    const partial = job.partialStoryA as unknown as AnalysisStoryData;
    return (
      <main className="market-story min-h-screen bg-[#070809]">
        <SiteHeader />
        <article>
          <AnalysisHero story={partial} />
          <AnalogySection analogy={partial.analogy} />
          <BackgroundSection background={partial.background} />
          <InsightSection insight={partial.keyInsight} />
          <EvidenceSection evidence={partial.evidence} />
          <section className="story-section">
            <div className="story-container story-narrow rounded-3xl border border-gold/20 bg-gold/[0.035] p-6 sm:p-8">
              <p className="story-kicker">{job.status === "failed" ? "PARTIAL RESEARCH · 部分结果" : "RESEARCH CONTINUES"}</p>
              <h2 className="story-partial-status-title">{job.status === "failed" ? "分析未完成，以上为已生成的部分内容。" : "正在继续分析资产影响、市场预期和风险……"}</h2>
              {job.status === "failed" ? (
                <><p className="mt-5 text-sm leading-6 text-zinc-300">{job.error || "研究服务暂时未能返回完整结果。"}</p><button type="button" onClick={retry} disabled={retrying} className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-60">{retrying ? "正在创建新任务…" : "重新尝试"}</button></>
              ) : <><ResearchProgress status={job.status} /><WaitingNotice elapsedSeconds={elapsedSeconds} stageElapsedSeconds={stageElapsedSeconds} pollError={pollError} /></>}
            </div>
          </section>
        </article>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070809]">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
        <p className="eyebrow">MARKETARC · LIVE RESEARCH</p>
        <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-5xl">{job.question}</h1>
        {job.status === "failed" ? (
          <div className="mt-10 rounded-3xl border border-red-400/20 bg-red-400/[0.04] p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white">这次研究没有成功完成。</h2>
            {job.error ? <p className="mt-3 text-sm leading-6 text-zinc-300">{job.error}</p> : null}
            <button type="button" onClick={retry} disabled={retrying} className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-60">{retrying ? "正在创建新任务…" : "重新尝试"}</button>
          </div>
        ) : <><ResearchProgress status={job.status} /><WaitingNotice elapsedSeconds={elapsedSeconds} stageElapsedSeconds={stageElapsedSeconds} pollError={pollError} /></>}
        <QuickTake job={job} />
      </section>
    </main>
  );
}
