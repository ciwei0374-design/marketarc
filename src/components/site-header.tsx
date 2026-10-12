import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-white/[0.07]">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex flex-col justify-center leading-none text-white">
          <span className="text-base font-semibold tracking-tight">资见 <span className="text-gold">AI</span></span>
          <span className="mt-1 text-[8px] font-medium uppercase tracking-[0.22em] text-zinc-500">MARKETARC</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <Link className="transition-colors hover:text-white" href="/today">今日市场</Link>
          <Link className="text-zinc-100" href="/">AI 看懂</Link>
          <Link className="transition-colors hover:text-white" href="/map">投资地图</Link>
        </div>
        <div className="flex gap-4 text-xs text-zinc-400 md:hidden"><Link href="/today">今日</Link><Link href="/map">地图</Link></div>
        <span className="rounded-full border border-gold/30 bg-gold/[0.07] px-3 py-1.5 text-xs font-medium tracking-wide text-gold">
          MVP Demo
        </span>
      </nav>
    </header>
  );
}
