"use client";

import { useOptimistic, useTransition, useState } from "react";
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
  const [showReceipt, setShowReceipt] = useState(false);

  const isIncome = tx.type === "income";

  async function handleDelete() {
    if (!confirm("Hapus transaksi ini?")) return;

    startTransition(async () => {
      setOptimisticDelete(true);
      const result = await deleteTransaction(tx.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Transaksi dihapus");
      router.refresh();
    });
  }

  if (isDeleted) return null;

  const parts = tx.category.split(" ");
  const emoji = parts[0];
  const label = parts.slice(1).join(" ") || tx.category;

  return (
    <>
      <li
        className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-50 last:border-0 transition-all duration-200"
        style={{ opacity: isPending ? 0.4 : 1 }}
      >
        {/* emoji icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
          style={{ background: isIncome ? "var(--accent-50)" : "#f0fdf4" }}
        >
          {emoji}
        </div>

        {/* detail */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-700 truncate leading-tight">
            {label}
          </p>
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            <span className="text-[11px] text-stone-400">{tx.user.name}</span>
            <span className="text-stone-200 text-[10px]">·</span>
            <span className="text-[11px] text-stone-400">{tx.wallet.name}</span>
            <span className="text-stone-200 text-[10px]">·</span>
            <span className="text-[11px] text-stone-400">{formatDate(tx.date)}</span>
          </div>
          {tx.note && (
            <p className="text-[11px] text-stone-300 mt-0.5 truncate italic">
              &quot;{tx.note}&quot;
            </p>
          )}
          {/* Receipt indicator */}
          {tx.receiptUrl && (
            <button
              onClick={() => setShowReceipt(true)}
              className="text-[10px] font-semibold mt-0.5 tracking-wide"
              style={{ color: "var(--accent-400)" }}
            >
              📎 Lihat struk
            </button>
          )}
        </div>

        {/* nominal + hapus */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <p
            className="text-sm font-semibold"
            style={{ color: isIncome ? "#10b981" : "var(--accent-500)" }}
          >
            {isIncome ? "+" : "−"}{formatCurrency(Number(tx.amount), true)}
          </p>

          {/*
            Desktop: tombol muncul on hover (group-hover)
            Mobile : tombol selalu visible (ukuran lebih kecil, opacity lebih rendah)
          */}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="
              p-1.5 rounded-lg transition-all disabled:opacity-30
              text-stone-300 hover:text-red-400 hover:bg-red-50 active:bg-red-100
              opacity-40 md:opacity-0 md:group-hover:opacity-100
            "
            aria-label="Hapus transaksi"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </li>

      {/* Receipt modal */}
      {showReceipt && tx.receiptUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowReceipt(false)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-50">
              <p className="text-sm font-semibold text-stone-700">Struk {label}</p>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-stone-400 hover:text-stone-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <img src={tx.receiptUrl} alt="Struk" className="w-full object-contain max-h-[60vh]" />
          </div>
        </div>
      )}
    </>
  );
}