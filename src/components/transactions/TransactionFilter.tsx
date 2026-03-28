"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const YEARS = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - 1 + i);

export function TransactionFilter() {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const now          = new Date();
  const currentMonth = params.get("month") ?? String(now.getMonth() + 1);
  const currentYear  = params.get("year")  ?? String(now.getFullYear());
  const currentType  = params.get("type")  ?? "all";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  }

  return (
    <div className="space-y-3 mb-5">
      {/* Loading indicator */}
      {isPending && (
        <div className="h-0.5 rounded-full overflow-hidden bg-stone-100">
          <div
            className="h-full animate-pulse rounded-full"
            style={{ background: "var(--accent-400)", width: "60%" }}
          />
        </div>
      )}

      {/* bulan + tahun */}
      <div className="flex gap-2" style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
        <select
          value={currentMonth}
          onChange={(e) => update("month", e.target.value)}
          disabled={isPending}
          className="flex-1 bg-white border border-stone-100 rounded-xl px-3 py-2.5 text-sm text-stone-700 outline-none transition-all"
          style={{ boxShadow: "var(--shadow-card)" }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-200, var(--accent-100))"; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
        >
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={currentYear}
          onChange={(e) => update("year", e.target.value)}
          disabled={isPending}
          className="w-28 bg-white border border-stone-100 rounded-xl px-3 py-2.5 text-sm text-stone-700 outline-none transition-all"
          style={{ boxShadow: "var(--shadow-card)" }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-200, var(--accent-100))"; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* tipe */}
      <div className="flex gap-2" style={{ opacity: isPending ? 0.6 : 1, transition: "opacity 0.2s" }}>
        {(["all", "income", "expense"] as const).map((t) => {
          const active = currentType === t;
          const activeStyle =
            t === "income"  ? { background: "#10b981", color: "#fff" } :
            t === "expense" ? { background: "var(--accent-500)", color: "#fff", boxShadow: "var(--shadow-accent)" } :
                              { background: "#1c1917", color: "#fff" };
          return (
            <button
              key={t}
              onClick={() => update("type", t)}
              disabled={isPending}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
              style={active ? activeStyle : { background: "#fff", color: "#a8a29e", boxShadow: "var(--shadow-card)" }}
            >
              {t === "all" ? "Semua" : t === "income" ? "💰 Masuk" : "💸 Keluar"}
            </button>
          );
        })}
      </div>
    </div>
  );
}