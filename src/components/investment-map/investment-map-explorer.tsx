"use client";

import { useState } from "react";
import type { InvestmentMapData } from "@/types/investment-map";

export function InvestmentMapExplorer({ data }: { data: InvestmentMapData }) {
  const [activeId, setActiveId] = useState(data.paths[0].id);
  const active = data.paths.find((item) => item.id === activeId) ?? data.paths[0];

  return (
    <>
      <div className="map-tabs" role="tablist" aria-label="选择市场事件">
        {data.paths.map((item, index) => <button key={item.id} role="tab" aria-selected={item.id === active.id} aria-controls="map-active-path" id={`map-tab-${item.id}`} onClick={() => setActiveId(item.id)}><span>0{index + 1}</span>{item.event}</button>)}
      </div>
      <article id="map-active-path" className="map-path" role="tabpanel" aria-labelledby={`map-tab-${active.id}`}>
        <header><p>你选择的事件</p><h2>{active.eventQuestion}</h2><div className="map-plain"><strong>先用人话理解</strong><span>{active.plainLanguage}</span></div></header>
        <section className="map-mechanism"><div className="map-section-title"><span>01</span><div><p>MECHANISM</p><h3>{active.mechanismName}</h3></div></div><ol>{active.mechanismSteps.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p>{index < active.mechanismSteps.length - 1 ? <i aria-hidden="true">→</i> : null}</li>)}</ol></section>
        <section><div className="map-section-title"><span>02</span><div><p>ASSET CLASSES</p><h3>资产影响不是一个方向</h3></div></div><div className="map-assets">{active.assetEffects.map((effect) => <div key={effect.assetClass}><span>{effect.tendency}</span><h4>{effect.assetClass}</h4><p>{effect.explanation}</p></div>)}</div></section>
        <section className="map-conditions"><div className="map-section-title"><span>03</span><div><p>COUNTERCONDITIONS</p><h3>什么会打断主逻辑？</h3></div></div><div>{active.counterconditions.map((entry) => <article key={entry.condition}><strong>如果：{entry.condition}</strong><p>那么：{entry.consequence}</p></article>)}</div></section>
        <section><div className="map-section-title"><span>04</span><div><p>WHAT TO WATCH</p><h3>下一步怎样更新判断？</h3></div></div><div className="map-watch">{active.watchSignals.map((signal) => <article key={signal.indicator}><h4>{signal.indicator}</h4><div><span>↑ 上升</span><p>{signal.rising}</p></div><div><span>↓ 下降</span><p>{signal.falling}</p></div></article>)}</div></section>
      </article>
    </>
  );
}
