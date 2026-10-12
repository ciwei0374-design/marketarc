"use client";
export default function InvestmentMapError({ reset }: { reset: () => void }) { return <main className="investment-map"><section className="map-state" role="alert"><p className="eyebrow">INVESTMENT MAP</p><h1>投资地图暂时无法读取</h1><p>这里不会用未经验证的确定性关系代替缺失内容。</p><button type="button" onClick={reset}>重新读取</button></section></main>; }
