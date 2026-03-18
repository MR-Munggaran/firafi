import { getWallets } from "@/actions/wallets";
import { getTransactions } from "@/actions/transactions";
import { getGoals } from "@/actions/goals";
import { getCoupleInfo } from "@/actions/couples";
import { getCurrentMonthYear, formatMonth } from "@/lib/format";
import { BalanceCard }         from "@/components/dashboard/BalanceCard";
import { WalletList }          from "@/components/dashboard/WalletList";
import { GoalsPreview }        from "@/components/dashboard/GoalsPreview";
import { RecentTransactions }  from "@/components/dashboard/RecentTransactions";
import { QuickAdd }            from "@/components/dashboard/QuickAdd";

export default async function DashboardPage() {
  const { month, year } = getCurrentMonthYear();

  const [walletsRes, txRes, goalsRes, coupleRes] = await Promise.allSettled([
    getWallets(),
    getTransactions({ month, year, limit: 100 }),
    getGoals(),
    getCoupleInfo(),
  ]);

  const wallets      = walletsRes.status === "fulfilled" ? walletsRes.value : [];
  const transactions = txRes.status      === "fulfilled" ? txRes.value      : [];
  const goals        = goalsRes.status   === "fulfilled" ? goalsRes.value   : [];
  const couple       = coupleRes.status  === "fulfilled" ? coupleRes.value  : null;

  const monthlyIncome  = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const monthlyExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const recentTx = transactions.slice(0, 5);

  return (
    <>
      {/* greeting */}
      <header className="mb-5 animate-fade-in">
        <p
          className="text-xs font-medium tracking-widest uppercase mb-0.5"
          style={{ color: "var(--accent-400)" }}
        >
          💕 {couple?.name ?? "Firafi"}
        </p>
        <h1 className="font-display text-2xl font-semibold text-stone-800 leading-tight">
          {formatMonth(month, year)}
        </h1>
      </header>

      {/* hero balance */}
      <div className="animate-slide-up">
        <BalanceCard
          wallets={wallets}
          monthlyIncome={monthlyIncome}
          monthlyExpense={monthlyExpense}
          coupleName={couple?.name ?? "Firafi"}
        />
      </div>

      <WalletList wallets={wallets} />
      <GoalsPreview goals={goals} />
      <RecentTransactions transactions={recentTx} />
      <QuickAdd />
    </>
  );
}
