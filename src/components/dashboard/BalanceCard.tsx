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
      className="relative overflow-hidden rounded-3xl p-5 sm:p-6"
      style={{
        background: "linear-gradient(135deg, var(--accent-400) 0%, var(--accent-500) 50%, var(--accent-600) 100%)",
        boxShadow:  "var(--shadow-accent)",
      }}
    >
      {/* ornamen dekoratif */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-12 -left-6 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-5 right-20 w-3 h-3 rounded-full bg-white/20 pointer-events-none" />

      <div className="relative z-10">
        {/* label couple */}
        <p className="text-white/70 text-[10px] font-medium tracking-widest uppercase mb-1.5">
          {coupleName}
        </p>

        {/* total balance — clamp agar tidak overflow di layar kecil */}
        <p
          className="font-display font-semibold text-white leading-tight mb-5"
          style={{ fontSize: "clamp(1.6rem, 6vw, 2.5rem)" }}
        >
          {formatCurrency(totalBalance)}
        </p>

        {/* stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Masuk",   value: monthlyIncome,  color: "text-white"    },
            { label: "Keluar",  value: monthlyExpense, color: "text-white"    },
            { label: "Selisih", value: net,            color: net >= 0 ? "text-white" : "text-white/70" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/15 rounded-2xl px-3 py-2.5">
              <p className="text-white/60 text-[9px] font-medium tracking-wide uppercase mb-1">
                {label}
              </p>
              <p className={`font-semibold text-xs sm:text-sm leading-none ${color}`}>
                {label === "Selisih" && value >= 0 ? "+" : ""}
                {formatCurrency(value, true)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}