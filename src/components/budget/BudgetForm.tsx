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
  
  // Custom Dropdown States
  const [category, setCategory] = useState("");
  const [isCatOpen, setIsCatOpen] = useState(false);
  
  const [month, setMonth] = useState(currentMonth);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  
  const [year, setYear] = useState(currentYear);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  // Close all dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (catRef.current && !catRef.current.contains(target)) setIsCatOpen(false);
      if (monthRef.current && !monthRef.current.contains(target)) setIsMonthOpen(false);
      if (yearRef.current && !yearRef.current.contains(target)) setIsYearOpen(false);
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
      category: category,
      amount: Number(fd.get("amount")),
      month: month,
      year: year,
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
        className="group w-full py-4 rounded-[1.5rem] border-2 border-dashed border-stone-200 text-stone-400 text-sm font-bold flex items-center justify-center gap-2 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/30 transition-all duration-300"
      >
        <div className="bg-stone-100 p-1 rounded-full group-hover:bg-rose-100 group-hover:scale-110 transition-all">
          <Plus className="w-4 h-4" />
        </div>
        Tambah Budget Kategori
      </button>
    );
  }

  return (
    <div className="pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/40 p-7 border border-stone-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-200">
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
          
          {/* Kategori - Custom Dropdown */}
          <div className="space-y-2 relative" ref={catRef}>
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-1">Kategori</label>
            <button
              type="button"
              onClick={() => setIsCatOpen(!isCatOpen)}
              className={`w-full flex items-center justify-between bg-stone-50 px-5 py-4 rounded-2xl text-sm font-bold border-2 transition-all ${
                isCatOpen ? "border-rose-400 bg-white shadow-sm" : "border-transparent text-stone-700 hover:bg-stone-100/50"
              }`}
            >
              <span className={category ? "text-stone-800" : "text-stone-300"}>
                {category || "Pilih kategori..."}
              </span>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCatOpen && (
              <div className="absolute z-[60] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 max-h-60 overflow-y-auto animate-in zoom-in-95 origin-top">
                {EXPENSE_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setCategory(c); setIsCatOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm transition-colors ${
                      category === c ? "bg-rose-50 text-rose-600 font-bold" : "hover:bg-stone-50 text-stone-600"
                    }`}
                  >
                    <span>{c}</span>
                    {category === c && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nominal - Modern Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-1">Maksimal Pengeluaran</label>
            <div className="relative group">
              <span className="absolute left-5 inset-y-0 flex items-center text-stone-300 font-bold text-xl group-focus-within:text-rose-400 transition-colors pointer-events-none">Rp</span>
              <input
                name="amount"
                type="number"
                required
                placeholder="0"
                className="w-full bg-stone-50 rounded-2xl pl-14 pr-5 py-5 text-2xl font-bold text-stone-800 placeholder-stone-200 focus:bg-white focus:ring-4 focus:ring-rose-50 outline-none transition-all"
              />
            </div>
          </div>

          {/* Periode - Grid Custom Dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Bulan Dropdown */}
            <div className="space-y-2 relative" ref={monthRef}>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Bulan
              </label>
              <button
                type="button"
                onClick={() => { setIsMonthOpen(!isMonthOpen); setIsYearOpen(false); }}
                className={`w-full flex items-center justify-between bg-stone-50 px-4 py-3.5 rounded-2xl text-sm font-bold border-2 transition-all ${
                  isMonthOpen ? "border-rose-400 bg-white shadow-sm" : "border-transparent text-stone-700"
                }`}
              >
                <span className="truncate">{MONTHS[month - 1]}</span>
                <ChevronDown className={`w-3 h-3 text-stone-400 flex-shrink-0 transition-transform ${isMonthOpen ? 'rotate-180' : ''}`} />
              </button>
              {isMonthOpen && (
                <div className="absolute z-[50] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 max-h-52 overflow-y-auto animate-in zoom-in-95 origin-top">
                  {MONTHS.map((m, i) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMonth(i + 1); setIsMonthOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors ${
                        month === i + 1 ? "bg-rose-50 text-rose-600 font-bold" : "hover:bg-stone-50 text-stone-600"
                      }`}
                    >
                      <span>{m}</span>
                      {month === i + 1 && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tahun Dropdown */}
            <div className="space-y-2 relative" ref={yearRef}>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Tahun
              </label>
              <button
                type="button"
                onClick={() => { setIsYearOpen(!isYearOpen); setIsMonthOpen(false); }}
                className={`w-full flex items-center justify-between bg-stone-50 px-4 py-3.5 rounded-2xl text-sm font-bold border-2 transition-all ${
                  isYearOpen ? "border-rose-400 bg-white shadow-sm" : "border-transparent text-stone-700"
                }`}
              >
                <span>{year}</span>
                <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform ${isYearOpen ? 'rotate-180' : ''}`} />
              </button>
              {isYearOpen && (
                <div className="absolute z-[50] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 p-2 animate-in zoom-in-95 origin-top">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => { setYear(y); setIsYearOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors ${
                        year === y ? "bg-rose-50 text-rose-600 font-bold" : "hover:bg-stone-50 text-stone-600"
                      }`}
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
            className="w-full py-5 bg-rose-500 hover:bg-rose-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-rose-200 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? "Menyimpan..." : "Simpan Target Budget 🎯"}
          </button>
        </form>
      </div>
    </div>
  );
}