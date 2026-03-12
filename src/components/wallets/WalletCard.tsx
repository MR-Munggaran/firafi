"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteWallet } from "@/actions/wallets";
import { formatCurrency, formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import type { WalletWithOwner } from "@/actions/wallets";

const GRADIENTS = [
  { from: "#f43f5e", to: "#e11d48", shadow: "rgba(244,63,94,0.35)"   },
  { from: "#a855f7", to: "#7c3aed", shadow: "rgba(168,85,247,0.35)"  },
  { from: "#3b82f6", to: "#1d4ed8", shadow: "rgba(59,130,246,0.35)"  },
  { from: "#10b981", to: "#047857", shadow: "rgba(16,185,129,0.35)"  },
  { from: "#f59e0b", to: "#d97706", shadow: "rgba(245,158,11,0.35)"  },
];

const WALLET_TYPE_LABEL: Record<string, string> = {
  cash:       "💵 Tunai",
  bank:       "🏦 Bank",
  ewallet:    "📱 E-Wallet",
  investment: "📈 Investasi",
  other:      "💼 Lainnya",
};

interface Props {
  wallet:       WalletWithOwner;
  index:        number;
  totalIncome:  number;
  totalExpense: number;
}

export function WalletCard({ wallet, index, totalIncome, totalExpense }: Props) {
  const router  = useRouter();
  const grad    = GRADIENTS[index % GRADIENTS.length];
  const [busy, setBusy]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    if (!confirmDelete) {
      // tap pertama: minta konfirmasi inline
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000); // auto-cancel 3 detik
      return;
    }
    setBusy(true);
    const result = await deleteWallet(wallet.id);
    setBusy(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Dompet dihapus");
    router.refresh();
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-5"
      style={{
        background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.to} 100%)`,
        boxShadow:  `0 8px 28px -4px ${grad.shadow}`,
      }}
    >
      {/* ornamen */}
      <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 right-12 w-20 h-20 rounded-full bg-white/5" />
      <div className="absolute top-4 right-20 w-2.5 h-2.5 rounded-full bg-white/25" />

      {/* header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
            {wallet.owner?.name ?? "Bersama"} · {WALLET_TYPE_LABEL[wallet.type] ?? wallet.type}
          </p>
          <h3 className="text-white font-semibold text-base leading-tight truncate">
            {wallet.name}
          </h3>
        </div>

        {/* fix: tombol hapus selalu visible, pakai 2-tap confirm di mobile */}
        <button
          onClick={handleDelete}
          disabled={busy}
          className={`
            flex-shrink-0 h-8 rounded-xl flex items-center justify-center gap-1.5
            text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-50
            ${confirmDelete
              ? "bg-red-500 px-3 w-auto"
              : "bg-white/15 hover:bg-white/25 w-8"
            }
          `}
          aria-label="Hapus dompet"
        >
          <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
          {confirmDelete && <span>Yakin?</span>}
        </button>
      </div>

      {/* saldo */}
      <div className="relative z-10 mb-5">
        <p className="text-white/60 text-[11px] mb-0.5">Saldo</p>
        <p className="font-display text-3xl font-semibold text-white leading-none">
          {formatCurrency(Number(wallet.balance))}
        </p>
      </div>

      {/* income vs expense bulan ini */}
      <div className="relative z-10 flex gap-3">
        <div className="flex-1 bg-white/15 rounded-2xl px-3 py-2.5">
          <div className="flex items-center gap-1 mb-0.5">
            <TrendingUp className="w-3 h-3 text-white/70" />
            <p className="text-white/70 text-[10px] font-medium">Masuk</p>
          </div>
          <p className="text-white font-semibold text-sm leading-none">
            {formatCurrency(totalIncome, true)}
          </p>
        </div>
        <div className="flex-1 bg-white/15 rounded-2xl px-3 py-2.5">
          <div className="flex items-center gap-1 mb-0.5">
            <TrendingDown className="w-3 h-3 text-white/70" />
            <p className="text-white/70 text-[10px] font-medium">Keluar</p>
          </div>
          <p className="text-white font-semibold text-sm leading-none">
            {formatCurrency(totalExpense, true)}
          </p>
        </div>
      </div>

      <p className="relative z-10 text-white/40 text-[10px] mt-3">
        Dibuat {formatDate(wallet.createdAt)}
      </p>
    </div>
  );
}