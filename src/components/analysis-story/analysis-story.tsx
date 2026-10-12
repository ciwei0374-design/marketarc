import type { AnalysisStory as AnalysisStoryData } from "@/types/analysis";
import { SiteHeader } from "@/components/site-header";
import { AnalysisHero } from "./analysis-hero";
import { AnalogySection, BackgroundSection } from "./analogy-section";
import { InsightSection } from "./insight-section";
import { AssetExplanation } from "./asset-explanation";
import { EvidenceSection, SourcesSection, WatchlistSection } from "./evidence-watchlist";
import { ExpectationGap } from "./expectation-gap";
import { MentalModel } from "./mental-model";

export function AnalysisStory({ story }: { story: AnalysisStoryData }) {
  return (
    <main className="market-story min-h-screen bg-[#070809]">
      <SiteHeader />
      <article>
        <AnalysisHero story={story} />
        <AnalogySection analogy={story.analogy} />
        <BackgroundSection background={story.background} />
        <InsightSection insight={story.keyInsight} />
        {story.assetSections.map((section) => <AssetExplanation section={section} key={section.id} />)}
        <EvidenceSection evidence={story.evidence} />
        <ExpectationGap section={story.expectationGap} />
        <WatchlistSection watchlist={story.watchlist} />
        <section className="story-section" id="framework">
          <div className="story-container">
            <p className="story-kicker">{story.reviewFramework.kicker}</p>
            <h2>{story.reviewFramework.title.map((line) => <span key={line}>{line}<br /></span>)}</h2>
            <div className="question-grid">
              {story.reviewFramework.questions.map((item, index) => <div key={item}><span>0{index + 1}</span><p>{item}</p></div>)}
            </div>
          </div>
        </section>
        <MentalModel
          model={story.mentalModel}
          validAnchorIds={new Set([story.analogy.id, story.expectationGap.id, story.watchlist.id, "framework"])}
        />
        <SourcesSection sources={story.sources} label={story.sourceLabel} methodology={story.methodology} />
      </article>
    </main>
  );
}
