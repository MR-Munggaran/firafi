"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const YEARS = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - 1 + i);

export function TransactionFilter() {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  const now          = new Date();
  const currentMonth = params.get("month") ?? String(now.getMonth() + 1);
  const currentYear  = params.get("year")  ?? String(now.getFullYear());
  const currentType  = params.get("type")  ?? "all";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="space-y-3 mb-5">
      {/* bulan + tahun */}
      <div className="flex gap-2">
        <select
          value={currentMonth}
          onChange={(e) => update("month", e.target.value)}
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
          className="w-28 bg-white border border-stone-100 rounded-xl px-3 py-2.5 text-sm text-stone-700 outline-none transition-all"
          style={{ boxShadow: "var(--shadow-card)" }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-200, var(--accent-100))"; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
        >
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* tipe */}
      <div className="flex gap-2">
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
