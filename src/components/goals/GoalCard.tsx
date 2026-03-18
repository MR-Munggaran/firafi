"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToGoal, deleteGoal } from "@/actions/goals";
import { formatCurrency, formatDate, calcPercent } from "@/lib/format";
import { toast } from "sonner";
import { Trash2, Plus, Calendar, CheckCircle2 } from "lucide-react";
import type { Goal } from "@/actions/goals";

export function GoalCard({ goal }: { goal: Goal }) {
  const router = useRouter();
  const [adding, setAdding]   = useState(false);
  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);

  const saved     = Number(goal.savedAmount);
  const target    = Number(goal.targetAmount);
  const pct       = calcPercent(saved, target);
  const remaining = target - saved;
  const done      = pct >= 100;

  async function handleAdd() {
    const num = Number(amount);
    if (!num || num <= 0) return toast.error("Masukkan jumlah yang valid");
    setLoading(true);
    const result = await addToGoal(goal.id, num);
    setLoading(false);
    if (!result.success) return toast.error(result.error);
    toast.success(`+${formatCurrency(num, true)} ditambahkan! 🎉`);
    setAmount(""); setAdding(false); router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Hapus target ini?")) return;
    const result = await deleteGoal(goal.id);
    if (!result.success) return toast.error(result.error);
    toast.success("Target dihapus"); router.refresh();
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden group" style={{ boxShadow: "var(--shadow-card)" }}>
      <div
        className="relative h-20 flex items-center justify-between px-5"
        style={{ background: "linear-gradient(135deg, var(--accent-50), var(--accent-100))" }}
      >
        <span className="text-4xl">{goal.emoji ?? "🎯"}</span>
        <div className="flex items-center gap-2">
          {done && (
            <div className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Tercapai!
            </div>
          )}
          <button onClick={handleDelete} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-300 hover:text-red-400 hover:bg-red-50/80 transition-all" aria-label="Hapus target">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-display text-lg font-semibold text-stone-800 leading-tight">{goal.name}</h3>
          {goal.targetDate && (
            <div className="flex items-center gap-1 flex-shrink-0 text-stone-400">
              <Calendar className="w-3 h-3" />
              <span className="text-[11px]">{formatDate(goal.targetDate)}</span>
            </div>
          )}
        </div>

        <div className="mb-2">
          <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(pct, 100)}%`,
                background: done ? "#34d399" : "linear-gradient(to right, var(--accent-400), var(--accent-500))",
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500 font-medium">{formatCurrency(saved, true)}</p>
            <p className="text-xs font-semibold" style={{ color: "var(--accent-500)" }}>{pct}%</p>
            <p className="text-xs text-stone-400">{formatCurrency(target, true)}</p>
          </div>
        </div>

        {!done && (
          <p className="text-[11px] text-stone-400 mb-3">
            Kurang <span className="font-semibold" style={{ color: "var(--accent-400)" }}>{formatCurrency(remaining, true)}</span> lagi
          </p>
        )}

        {!done && (
          adding ? (
            <div className="flex gap-2 mt-2">
              <div className="flex-1 flex items-center gap-1.5 bg-stone-50 rounded-xl px-3 py-2">
                <span className="text-stone-300 text-xs font-display">Rp</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Jumlah..." autoFocus className="flex-1 bg-transparent text-sm text-stone-700 focus:outline-none placeholder-stone-300" />
              </div>
              <button onClick={handleAdd} disabled={loading} className="px-4 py-2 text-white text-xs font-semibold rounded-xl disabled:opacity-60 active:scale-95 transition-all" style={{ background: "var(--accent-500)", boxShadow: "var(--shadow-accent)" }}>
                {loading ? "..." : "Tambah"}
              </button>
              <button onClick={() => { setAdding(false); setAmount(""); }} className="px-3 py-2 bg-stone-100 text-stone-400 text-xs font-semibold rounded-xl">Batal</button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="w-full py-2.5 rounded-xl border-2 border-dashed text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2" style={{ borderColor: "var(--accent-100)", color: "var(--accent-400)" }}>
              <Plus className="w-3.5 h-3.5" /> Tambah Tabungan
            </button>
          )
        )}
      </div>
    </div>
  );
}
