import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DemoAccessForm } from "@/components/demo-access-form";
import { DEMO_ACCESS_COOKIE, isDemoAccessEnabled, isValidDemoAccessToken } from "@/lib/demo-access";

export const dynamic = "force-dynamic";

export default async function DemoAccessPage() {
  if (!isDemoAccessEnabled()) redirect("/");
  const cookieStore = await cookies();
  if (isValidDemoAccessToken(cookieStore.get(DEMO_ACCESS_COOKIE)?.value)) redirect("/");

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#090a0c] px-6 py-16">
      <div className="hero-glow" />
      <section className="relative flex w-full max-w-xl flex-col items-center text-center">
        <p className="text-xs font-semibold tracking-[0.28em] text-[#d6b866]">MARKETARC</p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">资见 AI</h1>
        <p className="mt-5 text-base tracking-[0.18em] text-zinc-500">私人测试版本</p>
        <Suspense fallback={null}><DemoAccessForm /></Suspense>
        <p className="mt-8 text-xs leading-6 text-zinc-700">仅供受邀用户体验 · 不构成任何投资建议</p>
      </section>
    </main>
  );
}
