import { HomeAnalyzer } from "@/components/home-analyzer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <SiteHeader />
      <section className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center px-5 py-16 sm:px-8 lg:py-24">
        <div className="hero-glow" aria-hidden="true" />
        <div className="relative w-full max-w-4xl text-center">
          <p className="eyebrow">AI · INVESTMENT LEARNING</p>
          <h1 className="mt-6 text-6xl font-semibold tracking-[-0.055em] text-white sm:text-8xl">
            资见 <span className="text-gold">AI</span>
          </h1>
          <p className="mt-7 text-xl font-medium tracking-tight text-zinc-200 sm:text-3xl">
            看懂市场，建立自己的投资判断。
          </p>
          <p className="mt-4 text-sm leading-7 text-zinc-500 sm:text-base">
            把今天发生的财经事件，变成你的投资课。
          </p>
          <HomeAnalyzer />
        </div>
      </section>
    </main>
  );
}
