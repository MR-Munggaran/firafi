"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/format";
import { deleteTransaction } from "@/actions/transactions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { TransactionWithRelations } from "@/actions/transactions";

interface Props {
  tx: TransactionWithRelations;
}

export function TransactionItem({ tx }: Props) {
  const router    = useRouter();
  const [busy, setBusy] = useState(false);
  const isIncome  = tx.type === "income";

  async function handleDelete() {
    if (!confirm("Hapus transaksi ini?")) return;
    setBusy(true);
    const result = await deleteTransaction(tx.id);
    setBusy(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Transaksi dihapus");
    router.refresh();
  }

  // "🍔 Makan Siang" → emoji = "🍔", label = "Makan Siang"
  const parts  = tx.category.split(" ");
  const emoji  = parts[0];
  const label  = parts.slice(1).join(" ") || tx.category;

  return (
    <li className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-50 last:border-0 group">
      {/* emoji */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${isIncome ? "bg-emerald-50" : "bg-rose-50"}`}>
        {emoji}
      </div>

      {/* detail */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-700 truncate leading-tight">
          {label}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-[11px] text-stone-400">{tx.user.name}</span>
          <span className="text-stone-200">·</span>
          <span className="text-[11px] text-stone-400">{tx.wallet.name}</span>
          <span className="text-stone-200">·</span>
          <span className="text-[11px] text-stone-400">{formatDate(tx.date)}</span>
        </div>
        {/* schema v2: kolom "note" bukan "notes" */}
        {tx.note && (
          <p className="text-[11px] text-stone-300 mt-0.5 truncate italic">
            &quot;{tx.note}&quot;
          </p>
        )}
      </div>

      {/* nominal + hapus */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className={`text-sm font-semibold ${isIncome ? "text-emerald-500" : "text-rose-500"}`}>
          {isIncome ? "+" : "−"}{formatCurrency(Number(tx.amount))}
        </p>
        <button
          onClick={handleDelete}
          disabled={busy}
          className="opacity-0 group-hover:opacity-100 active:opacity-100 p-1.5 rounded-lg text-stone-300 hover:text-rose-400 hover:bg-rose-50 transition-all disabled:opacity-30"
          aria-label="Hapus transaksi"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </li>
  );
}