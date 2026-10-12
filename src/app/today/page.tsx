import todayMarketData from "../../../data/market/today-market.json";
import { SiteHeader } from "@/components/site-header";
import { TodayMarketView } from "@/components/today-market/today-market-view";
import { resolveTodayMarketState } from "@/lib/today-market";

export const metadata = { title: "今日市场｜资见 AI", description: "用事实、推断与不确定性，看懂今天重要的市场力量。" };

export default function TodayMarketPage() {
  const state = resolveTodayMarketState(todayMarketData);
  return <main className="today-market"><SiteHeader />{state.status === "empty" ? <section className="today-state"><p className="eyebrow">TODAY MARKET</p><h1>今天还没有可核对的市场主线</h1><p>我们宁可暂时留空，也不会用未经核对的信息填满页面。稍后再来看看。</p></section> : <TodayMarketView snapshot={state.snapshot} />}</main>;
}
