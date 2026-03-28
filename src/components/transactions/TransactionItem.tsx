"use client";

import { useOptimistic, useTransition } from "react";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleted, setOptimisticDelete] = useOptimistic(false);

  const isIncome = tx.type === "income";

  async function handleDelete() {
    if (!confirm("Hapus transaksi ini?")) return;

    startTransition(async () => {
      setOptimisticDelete(true); // ✅ langsung hilang dari UI

      const result = await deleteTransaction(tx.id);
      if (!result.success) {
        toast.error(result.error); // kalau gagal, React auto-revert optimistic state
        return;
      }
      toast.success("Transaksi dihapus");
      router.refresh();
    });
  }

  // Kalau sudah optimistically deleted, sembunyikan item
  if (isDeleted) return null;

  const parts = tx.category.split(" ");
  const emoji = parts[0];
  const label = parts.slice(1).join(" ") || tx.category;

  return (
    <li
      className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-50 last:border-0 group transition-opacity duration-200"
      style={{ opacity: isPending ? 0.4 : 1 }}
    >
      {/* emoji */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-base shrink-0"
        style={{ background: isIncome ? "var(--accent-50)" : "#f0fdf4" }}
      >
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
        {tx.note && (
          <p className="text-[11px] text-stone-300 mt-0.5 truncate italic">
            &quot;{tx.note}&quot;
          </p>
        )}
      </div>

      {/* nominal + hapus */}
      <div className="flex items-center gap-2 shrink-0">
        <p
          className="text-sm font-semibold"
          style={{ color: isIncome ? "#10b981" : "var(--accent-500)" }}
        >
          {isIncome ? "+" : "−"}{formatCurrency(Number(tx.amount))}
        </p>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="opacity-0 group-hover:opacity-100 active:opacity-100 p-1.5 rounded-lg text-stone-300 hover:text-red-400 hover:bg-red-50 transition-all disabled:opacity-30"
          aria-label="Hapus transaksi"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </li>
  );
}