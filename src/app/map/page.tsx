import mapData from "../../../data/market/investment-map.json";
import { SiteHeader } from "@/components/site-header";
import { InvestmentMapExplorer } from "@/components/investment-map/investment-map-explorer";
import { resolveInvestmentMapState } from "@/lib/investment-map";

export const metadata = { title: "投资地图｜资见 AI", description: "从事件、机制到资产影响，学习条件性的投资判断。" };

export default function InvestmentMapPage() {
  const state = resolveInvestmentMapState(mapData);
  return <main className="investment-map"><SiteHeader />{state.status === "empty" ? <section className="map-state"><p className="eyebrow">INVESTMENT MAP</p><h1>暂时没有可用的传导路径</h1><p>我们不会用确定性涨跌关系填充空白。稍后再来看看。</p></section> : <><header className="map-hero"><div className="map-shell"><p className="eyebrow">MARKETARC · INVESTMENT MAP V0.1</p><h1>{state.data.title}</h1><p>{state.data.lead}</p><small>投资教育内容 · 不构成投资建议、交易指令或收益保证</small></div></header><section className="map-explorer"><div className="map-shell"><InvestmentMapExplorer data={state.data} /></div></section><footer className="map-method"><div className="map-shell"><span>地图边界</span><p>{state.data.methodology}</p></div></footer></> }</main>;
}
