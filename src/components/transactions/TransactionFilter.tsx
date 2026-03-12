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
          className="flex-1 bg-white border border-stone-100 rounded-xl px-3 py-2.5 text-sm text-stone-700 shadow-card focus:outline-none focus:ring-2 focus:ring-rose-200"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={currentYear}
          onChange={(e) => update("year", e.target.value)}
          className="w-28 bg-white border border-stone-100 rounded-xl px-3 py-2.5 text-sm text-stone-700 shadow-card focus:outline-none focus:ring-2 focus:ring-rose-200"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* tipe */}
      <div className="flex gap-2">
        {(["all", "income", "expense"] as const).map((t) => (
          <button
            key={t}
            onClick={() => update("type", t)}
            className={`
              flex-1 py-2 rounded-xl text-xs font-semibold transition-all
              ${currentType === t
                ? t === "income"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : t === "expense"
                    ? "bg-rose-500 text-white shadow-rose-sm"
                    : "bg-stone-700 text-white shadow-sm"
                : "bg-white text-stone-400 shadow-card"
              }
            `}
          >
            {t === "all" ? "Semua" : t === "income" ? "💰 Masuk" : "💸 Keluar"}
          </button>
        ))}
      </div>
    </div>
  );
}