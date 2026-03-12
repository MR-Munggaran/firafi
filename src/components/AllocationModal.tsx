"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { applyAllocation, saveTemplate } from "@/actions/allocation";
import { AllocationRule, PRESET_TEMPLATES } from "@/lib/allocation-presets";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { X, ChevronDown, Check, Sparkles, Save, Trash2, PlusCircle } from "lucide-react";
import type { AllocationTemplate } from "@/actions/allocation";

interface Props {
  income: number;
  month: number;
  year: number;
  defaultTemplate: AllocationTemplate | null;
  onClose: () => void;
}

const ALL_CATEGORIES = [
  { category: "🍔 Makanan & Minuman", label: "Makan" },
  { category: "🏠 Rumah & Tagihan", label: "Tagihan" },
  { category: "🚗 Transportasi", label: "Transport" },
  { category: "💊 Kesehatan", label: "Kesehatan" },
  { category: "🎮 Hiburan", label: "Hiburan" },
  { category: "💑 Pacaran", label: "Pacaran" },
  { category: "👗 Fashion", label: "Fashion" },
  { category: "📚 Pendidikan", label: "Pendidikan" },
  { category: "✈️ Liburan", label: "Liburan" },
  { category: "💆 Perawatan Diri", label: "Perawatan" },
  { category: "🎁 Hadiah", label: "Hadiah" },
  { category: "💰 Tabungan", label: "Tabungan" },
  { category: "💸 Lainnya", label: "Lainnya" },
];

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function AllocationModal({ income, month, year, defaultTemplate, onClose }: Props) {
  const router = useRouter();
  const [rules, setRules] = useState<AllocationRule[]>(() => defaultTemplate?.rules ?? PRESET_TEMPLATES[0].rules);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  const total = rules.reduce((s, r) => s + r.percent, 0);
  const remaining = 100 - total;
  const isValid = Math.round(total) === 100;

  // --- Logika Helper ---
  const setPercent = (category: string, value: number) => {
    setRules((prev) => prev.map((r) => (r.category === category ? { ...r, percent: value } : r)));
  };

  const addCategory = (category: string, label: string) => {
    if (rules.find((r) => r.category === category)) return;
    setRules((prev) => [...prev, { category, label, percent: 0 }]);
  };

  const removeRule = (category: string) => {
    setRules((prev) => prev.filter((r) => r.category !== category));
  };

  // --- API Calls ---
  async function handleApply() {
    if (!isValid) return toast.error(`Total harus 100% (sekarang ${total}%)`);
    setLoading(true);
    const result = await applyAllocation(income, rules, month, year);
    setLoading(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Budget otomatis berhasil diterapkan! 🎉");
    router.refresh();
    onClose();
  }

  async function handleSaveTemplate() {
    if (!templateName.trim()) return toast.error("Masukkan nama template");
    setSaving(true);
    const result = await saveTemplate(templateName.trim(), rules, true);
    setSaving(false);
    if (result.success) {
      toast.success(`Template "${templateName}" disimpan!`);
      setShowSaveForm(false);
      setTemplateName("");
    }
  }

  return (
      <div className="fixed inset-0 z-[60] bg-stone-900/60 backdrop-blur-md flex items-end justify-center" onClick={onClose}>
        <div
          className="w-full max-w-md bg-white rounded-t-[2.5rem] flex flex-col h-[92dvh] animate-in slide-in-from-bottom-full duration-500 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. Header (Tetap) */}
          <div className="px-6 pt-6 pb-4 border-b border-stone-50 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-200">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-stone-800">Alokasi Otomatis</h3>
              </div>
              <button onClick={onClose} className="p-2 bg-stone-50 rounded-full text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 flex items-center justify-between border border-stone-100">
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Dicatat</p>
                <p className="text-xl font-black text-stone-800 tracking-tight">{formatCurrency(income)}</p>
              </div>
              <div className={`px-4 py-2 rounded-xl text-xs font-black shadow-sm ${isValid ? 'bg-emerald-500 text-white' : 'bg-rose-100 text-rose-600'}`}>
                {total}%
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {PRESET_TEMPLATES.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setRules(p.rules)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full border border-stone-100 bg-white text-[10px] font-bold text-stone-600 active:scale-95"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Scrollable Area (Kategori) */}
          {/* pb-4 saja agar tidak membuang ruang */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide">
            <div className="space-y-6">
              {rules.map((rule) => {
                const ruleAmount = Math.round((income * rule.percent) / 100);
                return (
                  <div key={rule.category} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{rule.category.split(" ")[0]}</span>
                        <div>
                          <p className="text-sm font-bold text-stone-800 leading-none mb-1">{rule.category.split(" ").slice(1).join(" ")}</p>
                          <p className="text-[11px] font-medium text-stone-400">{formatCurrency(ruleAmount)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-rose-500">{rule.percent}%</span>
                        <button onClick={() => removeRule(rule.category)} className="p-1 text-stone-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0} max={100} step={5}
                      value={rule.percent}
                      onChange={(e) => setPercent(rule.category, Number(e.target.value))}
                      className="w-full h-1.5 bg-stone-100 rounded-full appearance-none accent-rose-500 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-4 pb-4">
              <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-3">Tambah Kategori</p>
              <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.filter(c => !rules.find(r => r.category === c.category)).map((c) => (
                    <button key={c.category} onClick={() => addCategory(c.category, c.label)} className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-100 text-[10px] font-bold text-stone-500">
                      + {c.category}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* 3. Footer Section */}
          {/* pb disesuaikan: pb-20 (ruang nav) + 4 (ruang aman) = 24 */}
          <div className="px-6 pt-4 pb-24 bg-white border-t border-stone-50 shadow-[0_-15px_30px_rgba(0,0,0,0.05)] flex-shrink-0">
            <div className="flex items-center justify-between mb-4 text-[10px] font-bold uppercase tracking-widest">
              <span className={isValid ? 'text-emerald-500' : 'text-stone-400'}>
                {remaining > 0 ? `Sisa: ${remaining}%` : remaining < 0 ? `Lebih: ${Math.abs(remaining)}%` : "Pas! ✨"}
              </span>
              <div className="flex-1 mx-4 h-1.5 bg-stone-50 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${total > 100 ? "bg-red-400" : "bg-emerald-500"}`} style={{ width: `${Math.min(total, 100)}%` }} />
              </div>
              <span className="text-stone-800">{total}%</span>
            </div>

            <button
              onClick={handleApply}
              disabled={loading || !isValid}
              className={`w-full py-4 rounded-2xl text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                isValid ? 'bg-rose-500 shadow-rose-200' : 'bg-stone-100 text-stone-300 shadow-none'
              }`}
            >
              {loading ? "Menyimpan..." : "Terapkan Budget ✨"}
            </button>
            
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              className="w-full text-[10px] font-bold text-stone-300 uppercase tracking-widest mt-4 flex items-center justify-center gap-2"
            >
              <Save className="w-3 h-3" /> Simpan Template
            </button>
          </div>
        </div>
      </div>
    );
}