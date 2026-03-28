"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { ArrowUpDown } from "lucide-react";

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
  const currentSort  = params.get("sort")  ?? "desc"; // desc = terbaru dulu

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  }

  function toggleSort() {
    update("sort", currentSort === "desc" ? "asc" : "desc");
  }

  const selectBase =
    "bg-white border border-stone-100 rounded-xl px-3 py-2.5 text-sm text-stone-700 outline-none appearance-none cursor-pointer transition-all focus:ring-2 disabled:opacity-50";

  return (
    <div
      className="space-y-2.5 pb-1"
      style={{ opacity: isPending ? 0.7 : 1, transition: "opacity 0.15s" }}
    >
      {/* Loading bar */}
      <div
        className={`h-0.5 rounded-full overflow-hidden transition-opacity ${isPending ? "opacity-100" : "opacity-0"}`}
        style={{ background: "var(--accent-100)" }}
      >
        <div
          className="h-full rounded-full animate-pulse"
          style={{ background: "var(--accent-400)", width: "50%" }}
        />
      </div>

      {/* Bulan + Tahun + Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={currentMonth}
            onChange={(e) => update("month", e.target.value)}
            disabled={isPending}
            className={`${selectBase} w-full pr-8`}
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 text-xs">▾</span>
        </div>

        <div className="relative w-24">
          <select
            value={currentYear}
            onChange={(e) => update("year", e.target.value)}
            disabled={isPending}
            className={`${selectBase} w-full pr-8`}
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 text-xs">▾</span>
        </div>

        {/* Sort toggle */}
        <button
          onClick={toggleSort}
          disabled={isPending}
          title={currentSort === "desc" ? "Terbaru dulu — klik untuk balik" : "Terlama dulu — klik untuk balik"}
          className="flex items-center gap-1.5 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
          style={
            currentSort === "asc"
              ? { background: "var(--accent-500)", color: "#fff", boxShadow: "var(--shadow-accent)" }
              : { background: "#fff", color: "#a8a29e", boxShadow: "var(--shadow-card)" }
          }
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {currentSort === "desc" ? "Terbaru" : "Terlama"}
          </span>
        </button>
      </div>

      {/* Tipe filter */}
      <div className="flex gap-2">
        {(["all", "income", "expense"] as const).map((t) => {
          const active = currentType === t;
          const activeStyle =
            t === "income"  ? { background: "#10b981", color: "#fff", boxShadow: "0 4px 12px rgba(16,185,129,0.2)" } :
            t === "expense" ? { background: "var(--accent-500)", color: "#fff", boxShadow: "var(--shadow-accent)" } :
                              { background: "#1c1917", color: "#fff" };
          return (
            <button
              key={t}
              onClick={() => update("type", t)}
              disabled={isPending}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all disabled:opacity-50 active:scale-95"
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