import { getBudgets } from "@/actions/budgets";
import { getTransactions } from "@/actions/transactions";
import { formatCurrency, formatMonth, getCurrentMonthYear, calcPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { BudgetCard } from "@/components/budget/BudgetCard";
import { BudgetForm } from "@/components/budget/BudgetForm";

export default async function BudgetPage() {
  const { month, year } = getCurrentMonthYear();

  const [budgets, transactions] = await Promise.allSettled([
    getBudgets(month, year),
    getTransactions({ month, year, type: "expense", limit: 500 }),
  ]).then(([b, t]) => [
    b.status === "fulfilled" ? b.value : [],
    t.status === "fulfilled" ? t.value : [],
  ] as const);

  const spentByCategory = transactions.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.category] = (acc[tx.category] ?? 0) + Number(tx.amount);
    return acc;
  }, {});

  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount), 0);
  const totalSpent  = budgets.reduce((s, b) => s + (spentByCategory[b.category] ?? 0), 0);
  const overCount   = budgets.filter((b) => (spentByCategory[b.category] ?? 0) > Number(b.amount)).length;

  return (
    <>
      <PageHeader title="Budget" subtitle={formatMonth(month, year)} emoji="🐷" />

      {/* hero summary card — pakai CSS variable tema */}
      <div
        className="rounded-3xl p-5 mb-5 animate-slide-up"
        style={{
          background: "linear-gradient(135deg, var(--accent-400) 0%, var(--accent-600) 100%)",
          boxShadow:  "var(--shadow-accent)",
        }}
      >
        <p className="text-white/70 text-[11px] font-semibold uppercase tracking-widest mb-1">
          Total Budget Bulan Ini
        </p>
        <p className="font-display text-3xl font-semibold text-white mb-3">
          {formatCurrency(totalBudget)}
        </p>

        <div className="h-2 bg-white/25 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${Math.min(calcPercent(totalSpent, totalBudget), 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-white/70 text-xs">
            {formatCurrency(totalSpent, true)} dipakai
          </p>
          <div className="flex items-center gap-2">
            {overCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {overCount} over!
              </span>
            )}
            <p className="text-white text-xs font-semibold">
              {calcPercent(totalSpent, totalBudget)}%
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {budgets.length === 0 ? (
          <div className="bg-white rounded-2xl py-12 text-center animate-slide-up" style={{ boxShadow: "var(--shadow-card)" }}>
            <p className="text-3xl mb-2">🐷</p>
            <p className="text-sm text-stone-400 font-medium">Belum ada budget bulan ini</p>
            <p className="text-xs text-stone-300 mt-1">Tambahkan budget per kategori di bawah</p>
          </div>
        ) : (
          budgets.map((budget) => (
            <div key={budget.id} className="animate-slide-up">
              <BudgetCard
                budget={budget}
                spent={spentByCategory[budget.category] ?? 0}
              />
            </div>
          ))
        )}
      </div>

      <BudgetForm currentMonth={month} currentYear={year} />
    </>
  );
}
