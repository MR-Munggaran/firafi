"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, calcPercent } from "@/lib/format";
import { deleteBudget, updateBudget } from "@/actions/budgets";
import { toast } from "sonner";
import { Trash2, Pencil, Check, X } from "lucide-react";
import type { Budget } from "@/actions/budgets";

interface Props {
  budget: Budget;
  spent:  number;
}

export function BudgetCard({ budget, spent }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [newAmount, setNewAmount] = useState(String(Number(budget.amount)));
  const [busy, setBusy] = useState(false);

  const limit     = Number(budget.amount);
  const pct       = calcPercent(spent, limit);
  const remaining = limit - spent;
  const isOver    = spent > limit;
  const isWarn    = pct >= 75 && !isOver;

  // status warna: over=red, warn=amber, aman=accent tema
  const status = isOver
    ? { bar: "bg-red-400",   text: "text-red-500",   bg: "bg-red-50",   border: "border-red-100",   label: "Over!"  }
    : isWarn
    ? { bar: "bg-amber-400", text: "text-amber-500", bg: "bg-amber-50", border: "border-amber-100", label: "Hampir" }
    : { bar: "",             text: "",               bg: "",             border: "",                 label: "Aman"   };

  async function handleDelete() {
    if (!confirm("Hapus budget ini?")) return;
    setBusy(true);
    const result = await deleteBudget(budget.id);
    setBusy(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Budget dihapus");
    router.refresh();
  }

  async function handleUpdate() {
    const amount = Number(newAmount);
    if (!amount || amount <= 0) return toast.error("Nominal tidak valid");
    setBusy(true);
    const result = await updateBudget(budget.id, amount);
    setBusy(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Budget diperbarui");
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-700 leading-tight truncate">
            {budget.category}
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
              />
              <button
                onClick={handleUpdate}
                disabled={busy}
                className="p-1 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setEditing(false); setNewAmount(String(limit)); }}
                className="p-1 rounded-lg bg-stone-50 text-stone-400 hover:bg-stone-100 transition-colors"
              >
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
          {/* badge status */}
          {isOver || isWarn ? (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.bg} ${status.text} ${status.border}`}>
              {status.label}
            </span>
          ) : (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
              style={{
                background: "var(--accent-50)",
                color: "var(--accent-500)",
                borderColor: "var(--accent-100)",
              }}
            >
              Aman
            </span>
          )}

          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg text-stone-300 hover:bg-stone-50 active:bg-stone-50 transition-all"
                style={undefined}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-400)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                aria-label="Edit budget"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="p-1.5 rounded-lg text-stone-300 hover:text-red-400 hover:bg-red-50 active:bg-red-50 active:text-red-400 transition-all disabled:opacity-30"
                aria-label="Hapus budget"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* progress bar */}
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isOver ? "bg-red-400" : isWarn ? "bg-amber-400" : ""}`}
          style={!isOver && !isWarn ? { background: "var(--accent-400)", width: `${Math.min(pct, 100)}%` } : { width: `${Math.min(pct, 100)}%` }}
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