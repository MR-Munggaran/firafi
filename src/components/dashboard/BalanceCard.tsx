import { formatCurrency } from "@/lib/format";
import type { WalletWithOwner } from "@/actions/wallets";

interface Props {
  wallets:        WalletWithOwner[];
  monthlyIncome:  number;
  monthlyExpense: number;
  coupleName:     string;
}

export function BalanceCard({ wallets, monthlyIncome, monthlyExpense, coupleName }: Props) {
  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
  const net          = monthlyIncome - monthlyExpense;

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 mb-4"
      style={{
        background:  "linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)",
        boxShadow:   "0 8px 32px -4px rgba(244,63,94,0.40)",
      }}
    >
      {/* ornamen */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-4 w-28 h-28 rounded-full bg-white/5" />
      <div className="absolute top-4 right-16 w-3 h-3 rounded-full bg-white/20" />

      <div className="relative z-10">
        <p className="text-rose-100 text-xs font-medium tracking-widest uppercase mb-1">
          {coupleName}
        </p>

        <p className="font-display text-4xl font-semibold text-white leading-tight mb-5">
          {formatCurrency(totalBalance)}
        </p>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/15 rounded-2xl px-3 py-2.5">
            <p className="text-rose-100 text-[10px] font-medium tracking-wide uppercase mb-0.5">
              Masuk
            </p>
            <p className="text-white font-semibold text-sm leading-none">
              {formatCurrency(monthlyIncome, true)}
            </p>
          </div>
          <div className="flex-1 bg-white/15 rounded-2xl px-3 py-2.5">
            <p className="text-rose-100 text-[10px] font-medium tracking-wide uppercase mb-0.5">
              Keluar
            </p>
            <p className="text-white font-semibold text-sm leading-none">
              {formatCurrency(monthlyExpense, true)}
            </p>
          </div>
          <div className="flex-1 bg-white/15 rounded-2xl px-3 py-2.5">
            <p className="text-rose-100 text-[10px] font-medium tracking-wide uppercase mb-0.5">
              Selisih
            </p>
            <p className={`font-semibold text-sm leading-none ${net >= 0 ? "text-white" : "text-rose-200"}`}>
              {net >= 0 ? "+" : ""}{formatCurrency(net, true)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}