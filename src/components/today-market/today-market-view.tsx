import Link from "next/link";
import type { TodayMarketSnapshot } from "@/types/today-market";

const labels = {
  FACT: { title: "已知事实", hint: "可核对的输入与机制" },
  INFERENCE: { title: "当前推断", hint: "解释，不是预测" },
  UNCERTAINTY: { title: "不确定性", hint: "可能让解释失效的条件" },
} as const;

function Boundary({ type, children }: { type: keyof typeof labels; children: React.ReactNode }) {
  return (
    <div className={`today-boundary today-boundary-${type.toLowerCase()}`}>
      <div><strong>{type}</strong><span>{labels[type].title}</span></div>
      <p>{children}</p>
    </div>
  );
}

export function TodayMarketView({ snapshot }: { snapshot: TodayMarketSnapshot }) {
  return (
    <>
      <header className="today-hero">
        <div className="today-shell">
          <div className="today-meta"><span>MARKETARC · TODAY</span><time dateTime={snapshot.updatedAt}>{snapshot.freshnessLabel}</time></div>
          <p className="today-snapshot-warning" role="note">历史研究快照 · {snapshot.date}，并非今日实时行情。市场数据和判断可能已变化。</p>
          <h1>市场研究快照</h1>
          <p className="today-lead">{snapshot.lead}</p>
          <div className="today-legend" aria-label="信息边界说明">
            {Object.entries(labels).map(([key, value]) => <div key={key}><strong>{key}</strong><span>{value.hint}</span></div>)}
          </div>
          <p className="today-disclaimer">投资教育内容，不构成投资建议、涨跌预测或收益保证。</p>
        </div>
      </header>

      <section className="today-list" aria-label="今日重要市场主线">
        <div className="today-shell">
          {snapshot.items.map((item, index) => (
            <article className="today-item" key={item.id}>
              <div className="today-item-heading">
                <div><span className="today-number">0{index + 1}</span><span className="today-category">{item.category}</span></div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
              </div>
              <div className="today-boundaries">
                <Boundary type="FACT"><>{item.facts.map((fact) => <span key={fact}>{fact}</span>)}</></Boundary>
                <Boundary type="INFERENCE">{item.inference}</Boundary>
                <Boundary type="UNCERTAINTY">{item.uncertainty}</Boundary>
              </div>
              <div className="today-detail-grid">
                <div><h3>影响哪些变量</h3><dl>{item.variables.map((entry) => <div key={entry.name}><dt>{entry.name}</dt><dd>{entry.mechanism}</dd></div>)}</dl></div>
                <div><h3>接下来观察什么</h3><dl>{item.watch.map((entry) => <div key={entry.indicator}><dt>{entry.indicator}</dt><dd>{entry.signal}</dd></div>)}</dl></div>
              </div>
              <Link className="today-deep-link" href={item.analysisHref}>深入看懂这条机制 <span aria-hidden="true">→</span></Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="today-method">
        <div className="today-shell"><span>方法说明</span><p>{snapshot.methodology}</p></div>
      </footer>
    </>
  );
}
