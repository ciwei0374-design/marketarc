"use client";

export default function TodayMarketError({ reset }: { reset: () => void }) {
  return <main className="today-market"><section className="today-state" role="alert"><p className="eyebrow">TODAY MARKET</p><h1>今天的市场快照暂时无法读取</h1><p>现有分析仍然可用。你可以稍后重试，不会因此错过任何交易指令——这里不提供交易指令。</p><button type="button" onClick={reset}>重新读取</button></section></main>;
}
