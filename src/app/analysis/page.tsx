import Link from "next/link";
import { getMockAnalysis } from "../../../data/mock-analysis";
import { SiteHeader } from "@/components/site-header";
import { AnalysisStory } from "@/components/analysis-story/analysis-story";
import { getAnalysisStory } from "../../../data/analysis";
import { getCachedAnalysis } from "@/services/analysis-cache";

type AnalysisPageProps = { searchParams: Promise<{ q?: string | string[] }> };

function SectionTitle({ number, children }: { number: string; children: React.ReactNode }) {
  return <div className="mb-6 flex items-center gap-4"><span className="font-mono text-xs tracking-widest text-gold">{number}</span><h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">{children}</h2></div>;
}

function Flow({ items }: { items: string[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-center">
      {items.map((item, index) => (
        <div key={item} className="contents">
          <div className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-4 text-center text-sm leading-6 text-zinc-200">{item}</div>
          {index < items.length - 1 ? <span className="py-0.5 text-center text-gold/60 sm:-rotate-90" aria-hidden="true">↓</span> : null}
        </div>
      ))}
    </div>
  );
}

export default async function AnalysisPage({ searchParams }: AnalysisPageProps) {
  const params = await searchParams;
  const rawQuestion = Array.isArray(params.q) ? params.q[0] : params.q;
  const question = rawQuestion?.trim() || "这件财经事件意味着什么？";
  const analysis = getMockAnalysis(question);
  const story = getAnalysisStory(question) ?? await getCachedAnalysis(question);

  if (story) {
    return <AnalysisStory story={story} />;
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <article className="mx-auto max-w-5xl px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-gold"><span aria-hidden="true">←</span> 返回首页</Link>
        <header className="border-b border-white/[0.08] pb-12 pt-10 sm:pb-16">
          <p className="eyebrow">MARKETARC · MOCK ANALYSIS</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-6xl">{question}</h1>
          <p className="mt-5 text-sm text-zinc-600">本页面为投资教育演示，不构成投资建议。</p>
        </header>
        <div className="mt-8 grid gap-5 sm:mt-12">
          <section className="result-card border-gold/20 bg-gold/[0.045]"><SectionTitle number="01">一句话看懂</SectionTitle><p className="max-w-3xl text-lg leading-8 text-zinc-200 sm:text-xl">{analysis.summary}</p></section>
          <section className="result-card"><SectionTitle number="02">发生了什么？</SectionTitle><p className="max-w-3xl leading-8 text-zinc-400">{analysis.event}</p></section>
          <section className="result-card"><SectionTitle number="03">为什么现在发生？</SectionTitle><Flow items={analysis.reasons} /></section>
          <section className="result-card"><SectionTitle number="04">钱会怎么流？</SectionTitle><Flow items={analysis.moneyFlow} /></section>
          <section className="result-card"><SectionTitle number="05">哪些资产会受到影响？</SectionTitle><div className="grid gap-3 md:grid-cols-3">{analysis.assets.map((asset) => <div key={asset.name} className="rounded-xl border border-white/[0.08] bg-black/20 p-5"><h3 className="font-semibold text-white">{asset.name}</h3><p className="mt-3 text-sm leading-6 text-zinc-500">{asset.detail}</p></div>)}</div></section>
          <section className="result-card border-amber-300/20 bg-amber-300/[0.045]"><SectionTitle number="06">事情没这么简单</SectionTitle><p className="text-xl font-semibold text-amber-100 sm:text-2xl">{analysis.cautionTitle}</p><p className="mt-4 max-w-3xl leading-8 text-zinc-400">{analysis.caution}</p></section>
          <section className="result-card"><SectionTitle number="07">今天你学到了</SectionTitle><div className="flex flex-wrap gap-3">{analysis.tags.map((tag) => <span key={tag} className="rounded-full border border-gold/30 bg-gold/[0.07] px-4 py-2 text-sm text-gold">{tag}</span>)}</div></section>
          <section className="result-card"><SectionTitle number="08">以后遇到类似事情怎么看？</SectionTitle><p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">不要先问<span className="text-gold">“什么会涨？”</span></p><p className="mt-7 text-sm text-zinc-500">先问：</p><div className="mt-3 grid gap-3 md:grid-cols-3">{analysis.method.map((item) => <p key={item} className="rounded-xl border border-white/[0.08] px-5 py-4 text-zinc-200">“{item}”</p>)}</div></section>
        </div>
        <div className="mt-10 text-center"><Link href="/" className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-gold">分析另一个问题</Link></div>
      </article>
    </main>
  );
}
