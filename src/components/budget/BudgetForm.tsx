"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBudget } from "@/actions/budgets";
import { toast } from "sonner";
import { Plus, X, ChevronDown, Check, Target, Calendar } from "lucide-react";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const YEARS = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - 1 + i);

const EXPENSE_CATEGORIES = [
  "🍔 Makanan & Minuman", "🛒 Belanja", "🚗 Transportasi",
  "🏠 Rumah & Tagihan", "💊 Kesehatan", "👗 Fashion",
  "🎮 Hiburan", "📚 Pendidikan", "✈️ Liburan",
  "💆 Perawatan Diri", "🎁 Hadiah", "💸 Lainnya",
];

interface Props {
  currentMonth: number;
  currentYear: number;
}

export function BudgetForm({ currentMonth, currentYear }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState("");
  const [isCatOpen, setIsCatOpen] = useState(false);

  const [month, setMonth] = useState(currentMonth);
  const [isMonthOpen, setIsMonthOpen] = useState(false);

  const [year, setYear] = useState(currentYear);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const catRef   = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (catRef.current   && !catRef.current.contains(target))   setIsCatOpen(false);
      if (monthRef.current && !monthRef.current.contains(target))  setIsMonthOpen(false);
      if (yearRef.current  && !yearRef.current.contains(target))   setIsYearOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!category) return toast.error("Pilih kategori budget dulu ya!");

    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const result = await createBudget({
      category,
      amount: Number(fd.get("amount")),
      month,
      year,
    });

    setLoading(false);
    if (!result.success) return toast.error(result.error);

    toast.success("Budget berhasil dibuat! 💪");
    setOpen(false);
    setCategory("");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="group w-full py-4 rounded-[1.5rem] border-2 border-dashed border-stone-200 text-stone-400 text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300"
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent-300, var(--accent-400))";
          e.currentTarget.style.color = "var(--accent-500)";
          e.currentTarget.style.background = "var(--accent-50)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "";
          e.currentTarget.style.color = "";
          e.currentTarget.style.background = "";
        }}
      >
        <div className="bg-stone-100 p-1 rounded-full transition-all group-hover:scale-110"
          style={{ background: undefined }}
          ref={() => {
            // handled via parent hover
          }}
        >
          <Plus className="w-4 h-4" />
        </div>
        Tambah Budget Kategori
      </button>
    );
  }

  return (
    <div className="pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-7 border border-stone-50" style={{ boxShadow: "0 20px 60px -12px rgba(0,0,0,0.08)" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--accent-500)", boxShadow: "var(--shadow-accent)" }}
            >
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-stone-800">Set Budget</h3>
              <p className="text-xs text-stone-400 font-medium tracking-tight">Atur target pengeluaranmu</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-stone-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Kategori */}
          <div className="space-y-2 relative" ref={catRef}>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-1">Kategori</label>
            <button
              type="button"
              onClick={() => setIsCatOpen(!isCatOpen)}
              className="w-full flex items-center justify-between bg-stone-50 px-5 py-4 rounded-2xl text-sm font-bold border-2 transition-all"
              style={isCatOpen
                ? { borderColor: "var(--accent-400)", background: "#fff", boxShadow: "0 0 0 3px var(--accent-50)" }
                : { borderColor: "transparent" }
              }
            >
              <span className={category ? "text-stone-800" : "text-stone-300"}>
                {category || "Pilih kategori..."}
              </span>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isCatOpen ? "rotate-180" : ""}`} />
            </button>
            {isCatOpen && (
              <div className="absolute z-60 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 max-h-60 overflow-y-auto animate-in zoom-in-95 origin-top">
                {EXPENSE_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCategory(c); setIsCatOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm transition-colors"
                    style={category === c
                      ? { background: "var(--accent-50)", color: "var(--accent-600)", fontWeight: 700 }
                      : { color: "#57534e" }
                    }
                    onMouseEnter={(e) => { if (category !== c) e.currentTarget.style.background = "#f5f5f4"; }}
                    onMouseLeave={(e) => { if (category !== c) e.currentTarget.style.background = ""; }}
                  >
                    <span>{c}</span>
                    {category === c && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nominal */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-1">Maksimal Pengeluaran</label>
            <div className="relative group">
              <span
                className="absolute left-5 inset-y-0 flex items-center font-bold text-xl pointer-events-none transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Rp
              </span>
              <input
                name="amount"
                type="number"
                required
                placeholder="0"
                className="w-full bg-stone-50 rounded-2xl pl-14 pr-5 py-5 text-2xl font-bold text-stone-800 placeholder-stone-200 outline-none transition-all"
                onFocus={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.boxShadow = "0 0 0 4px var(--accent-50)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            </div>
          </div>

          {/* Periode */}
          <div className="grid grid-cols-2 gap-4">

            {/* Bulan */}
            <div className="space-y-2 relative" ref={monthRef}>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Bulan
              </label>
              <button
                type="button"
                onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
                className="w-full flex items-center justify-between bg-stone-50 px-4 py-3.5 rounded-2xl text-sm font-bold border-2 transition-all"
                style={isMonthOpen
                  ? { borderColor: "var(--accent-400)", background: "#fff", boxShadow: "0 0 0 3px var(--accent-50)" }
                  : { borderColor: "transparent", color: "#1c1917" }
                }
              >
                <span className="truncate">{MONTHS[month - 1]}</span>
                <ChevronDown className={`w-3 h-3 text-stone-400 flex-shrink-0 transition-transform ${isMonthOpen ? "rotate-180" : ""}`} />
              </button>
              {isMonthOpen && (
                <div className="absolute z-[50] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 max-h-52 overflow-y-auto animate-in zoom-in-95 origin-top">
                  {MONTHS.map((m, i) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMonth(i + 1); setIsMonthOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors"
                      style={month === i + 1
                        ? { background: "var(--accent-50)", color: "var(--accent-600)", fontWeight: 700 }
                        : { color: "#57534e" }
                      }
                      onMouseEnter={(e) => { if (month !== i + 1) e.currentTarget.style.background = "#f5f5f4"; }}
                      onMouseLeave={(e) => { if (month !== i + 1) e.currentTarget.style.background = ""; }}
                    >
                      <span>{m}</span>
                      {month === i + 1 && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tahun */}
            <div className="space-y-2 relative" ref={yearRef}>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Tahun
              </label>
              <button
                type="button"
                onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
                className="w-full flex items-center justify-between bg-stone-50 px-4 py-3.5 rounded-2xl text-sm font-bold border-2 transition-all"
                style={isYearOpen
                  ? { borderColor: "var(--accent-400)", background: "#fff", boxShadow: "0 0 0 3px var(--accent-50)" }
                  : { borderColor: "transparent", color: "#1c1917" }
                }
              >
                <span>{year}</span>
                <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isYearOpen ? "rotate-180" : ""}`} />
              </button>
              {isYearOpen && (
                <div className="absolute z-[50] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 animate-in zoom-in-95 origin-top">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => { setYear(y); setIsYearOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors"
                      style={year === y
                        ? { background: "var(--accent-50)", color: "var(--accent-600)", fontWeight: 700 }
                        : { color: "#57534e" }
                      }
                      onMouseEnter={(e) => { if (year !== y) e.currentTarget.style.background = "#f5f5f4"; }}
                      onMouseLeave={(e) => { if (year !== y) e.currentTarget.style.background = ""; }}
                    >
                      <span>{y}</span>
                      {year === y && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 text-white rounded-[1.5rem] font-bold transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
            style={{ background: "var(--accent-500)", boxShadow: "var(--shadow-accent)" }}
          >
            {loading ? "Menyimpan..." : "Simpan Target Budget 🎯"}
          </button>
        </form>
      </div>
    </div>
  );
}