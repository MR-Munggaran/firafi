"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, calcPercent } from "@/lib/format";
import { deleteBudget, updateBudget } from "@/actions/budgets";
import { toast } from "sonner";
import { Trash2, Pencil, Check, X, Loader2 } from "lucide-react";
import type { Budget } from "@/actions/budgets";

interface Props {
  budget: Budget;
  spent:  number;
}

export function BudgetCard({ budget, spent }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // --- States ---
  const [editing, setEditing] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  
  // Inisialisasi state langsung dari props
  const [localAmount, setLocalAmount] = useState(Number(budget.amount));
  const [newAmount, setNewAmount] = useState(String(Number(budget.amount)));

  /* SOLUSI ESLINT: "Adjusting state while rendering" 
     Tanpa useEffect, kita sinkronisasi state jika props dari server berubah 
     (Misalnya saat pindah bulan atau refresh data global).
  */
  const [prevAmount, setPrevAmount] = useState(budget.amount);
  if (budget.amount !== prevAmount) {
    setPrevAmount(budget.amount);
    setLocalAmount(Number(budget.amount));
    setNewAmount(String(Number(budget.amount)));
  }

  // --- Derived State (Kalkulasi UI) ---
  const limit     = localAmount;
  const pct       = calcPercent(spent, limit);
  const remaining = limit - spent;
  const isOver    = spent > limit;
  const isWarn    = pct >= 75 && !isOver;

  const status = isOver
    ? { bar: "bg-red-400",   text: "text-red-500",   bg: "bg-red-50",   border: "border-red-100",   label: "Over!"  }
    : isWarn
    ? { bar: "bg-amber-400", text: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", label: "Hampir" }
    : { bar: "bg-(--accent-400)", text: "text-(--accent-500)", bg: "bg-(--accent-50)", border: "border-(--accent-100)", label: "Aman" };

  // --- Handlers ---

  async function handleUpdate() {
    const amount = Number(newAmount);
    if (!amount || amount <= 0) return toast.error("Nominal tidak valid");

    const oldAmount = localAmount;
    
    // Optimistic Update: UI berubah instan
    setLocalAmount(amount);
    setEditing(false);

    startTransition(async () => {
      const result = await updateBudget(budget.id, amount);
      if (!result.success) {
        // Rollback jika gagal
        setLocalAmount(oldAmount);
        setNewAmount(String(oldAmount));
        toast.error(result.error || "Gagal memperbarui");
      } else {
        toast.success("Budget diperbarui");
        router.refresh(); 
      }
    });
  }

  async function handleDelete() {
    if (!confirm("Hapus budget ini?")) return;

    // Optimistic Delete: Langsung hilangkan dari layar
    setIsDeleted(true);

    startTransition(async () => {
      const result = await deleteBudget(budget.id);
      if (!result.success) {
        // Rollback: Munculkan kembali jika gagal
        setIsDeleted(false);
        toast.error(result.error || "Gagal menghapus");
      } else {
        toast.success("Budget dihapus");
        router.refresh();
      }
    });
  }

  // Jika kartu dihapus secara optimis, jangan render
  if (isDeleted) return null;

  return (
    <div 
      className={`bg-white rounded-2xl p-4 transition-all duration-300 ${isPending ? 'opacity-70' : 'opacity-100'}`} 
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-700 leading-tight truncate">
            {budget.category} 
            {isPending && <Loader2 className="inline w-3 h-3 animate-spin ml-2 text-stone-400" />}
          </p>

          {editing ? (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-stone-300 text-xs">Rp</span>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-28 text-xs text-stone-700 bg-stone-50 rounded-lg px-2 py-1 focus:outline-none"
                style={{ outline: "none", boxShadow: "0 0 0 2px var(--accent-100)" }}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
              />
              <button onClick={handleUpdate} className="p-1 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditing(false)} className="p-1 rounded-lg bg-stone-50 text-stone-400 hover:bg-stone-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-stone-400 mt-0.5">
              Maks. {formatCurrency(limit)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
            {status.label}
          </span>

          {!editing && (
            <>
              {/* Tailwind v4 fixed: hover:text-(--variable) */}
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg text-stone-300 hover:text-(--accent-400) hover:bg-stone-50 transition-all"
                aria-label="Edit budget"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="p-1.5 rounded-lg text-stone-300 hover:text-red-400 hover:bg-red-50 transition-all disabled:opacity-30"
                aria-label="Hapus budget"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${status.bar}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500 font-medium">
          {formatCurrency(spent, true)} dipakai
        </p>
        <p className={`text-xs font-semibold ${isOver ? "text-red-500" : "text-stone-400"}`}>
          {isOver
            ? `+${formatCurrency(Math.abs(remaining), true)} over`
            : `${formatCurrency(remaining, true)} sisa`
          }
        </p>
      </div>
    </div>
  );
}