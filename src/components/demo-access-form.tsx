"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export function DemoAccessForm() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/demo-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error || "暂时无法验证体验码。请稍后重试。");
        return;
      }
      const requestedPath = searchParams.get("next");
      const destination = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/";
      window.location.replace(destination);
    } catch {
      setError("暂时无法验证体验码。请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-12 w-full max-w-md">
      <label htmlFor="demo-code" className="mb-3 block text-sm text-zinc-400">输入体验码</label>
      <input
        id="demo-code"
        type="password"
        autoComplete="current-password"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition focus:border-[#d6b866]/60"
        placeholder="体验码"
        required
        autoFocus
      />
      {error ? <p className="mt-3 text-sm text-red-400" role="alert">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="mt-5 w-full rounded-2xl bg-[#d6b866] px-5 py-4 font-semibold text-[#090a0c] transition hover:bg-[#e2c87d] disabled:cursor-wait disabled:opacity-70"
      >
        {submitting ? "正在验证…" : "进入 Demo"}
      </button>
    </form>
  );
}
