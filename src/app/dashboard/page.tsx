import { Suspense } from "react";
import { getWallets } from "@/actions/wallets";
import { getTransactions } from "@/actions/transactions";
import { getGoals } from "@/actions/goals";
import { getCoupleInfo } from "@/actions/couples";
import { getCurrentMonthYear, formatMonth } from "@/lib/format";
import { BalanceCard }        from "@/components/dashboard/BalanceCard";
import { WalletList }         from "@/components/dashboard/WalletList";
import { GoalsPreview }       from "@/components/dashboard/GoalsPreview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { QuickAdd }           from "@/components/dashboard/QuickAdd";

// ─── Skeleton helpers ──────────────────────────────────────────────────────────

function BalanceSkeleton() {
  return <div className="rounded-3xl h-40 mb-6 animate-pulse bg-stone-200" />;
}

function HeaderSkeleton() {
  return (
    <div className="mb-6">
      <div className="h-3 w-20 rounded-full bg-stone-200 animate-pulse mb-2" />
      <div className="h-8 w-44 rounded-full bg-stone-200 animate-pulse" />
    </div>
  );
}

function WalletSkeleton() {
  return (
    <section className="mb-6">
      <div className="h-5 w-24 rounded-full bg-stone-200 animate-pulse mb-3" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-stone-200 animate-pulse" />
        ))}
      </div>
    </section>
  );
}

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <section className="mb-6">
      <div className="h-5 w-36 rounded-full bg-stone-200 animate-pulse mb-3" />
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3 ${i !== rows - 1 ? "border-b border-stone-50" : ""}`}
          >
            <div className="w-9 h-9 rounded-xl bg-stone-200 animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 rounded-full bg-stone-200 animate-pulse" />
              <div className="h-3 w-20 rounded-full bg-stone-100 animate-pulse" />
            </div>
            <div className="h-3.5 w-16 rounded-full bg-stone-200 animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Async data components ─────────────────────────────────────────────────────

async function DashboardHeader() {
  const { month, year } = getCurrentMonthYear();
  const couple = await getCoupleInfo().catch(() => null);

  return (
    <header className="mb-6 animate-fade-in">
      <p
        className="text-xs font-medium tracking-widest uppercase mb-1"
        style={{ color: "var(--accent-400)" }}
      >
        💕 {couple?.name ?? "Firafi"}
      </p>
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-stone-800 leading-tight">
        {formatMonth(month, year)}
      </h1>
    </header>
  );
}

async function DashboardBalance() {
  const { month, year } = getCurrentMonthYear();
  const [walletsRes, txRes, coupleRes] = await Promise.allSettled([
    getWallets(),
    getTransactions({ month, year, limit: 20 }),
    getCoupleInfo(),
  ]);
  const wallets      = walletsRes.status === "fulfilled" ? walletsRes.value : [];
  const transactions = txRes.status      === "fulfilled" ? txRes.value      : [];
  const couple       = coupleRes.status  === "fulfilled" ? coupleRes.value  : null;

  const monthlyIncome  = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const monthlyExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="animate-slide-up mb-6">
      <BalanceCard
        wallets={wallets}
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
        coupleName={couple?.name ?? "Firafi"}
      />
    </div>
  );
}

async function DashboardWallets() {
  const wallets = await getWallets().catch(() => []);
  return <WalletList wallets={wallets} />;
}

async function DashboardGoals() {
  const goals = await getGoals().catch(() => []);
  return <GoalsPreview goals={goals} />;
}

async function DashboardTransactions() {
  const { month, year } = getCurrentMonthYear();
  const transactions = await getTransactions({ month, year, limit: 5 }).catch(() => []);
  return <RecentTransactions transactions={transactions} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <>
      {/* Greeting */}
      <Suspense fallback={<HeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>

      {/* Balance card — full width */}
      <Suspense fallback={<BalanceSkeleton />}>
        <DashboardBalance />
      </Suspense>

      {/*
        Mobile  : 1 kolom stacked
        Desktop : 2 kolom — kiri (wallets + transaksi), kanan (goals)
        Kolom kanan di-pin dengan min-w agar tidak terlalu sempit
      */}
      <div className="md:grid md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_340px] md:gap-6 lg:gap-8 md:items-start">

        {/* Kolom kiri */}
        <div>
          <Suspense fallback={<WalletSkeleton />}>
            <DashboardWallets />
          </Suspense>

          <Suspense fallback={<ListSkeleton rows={5} />}>
            <DashboardTransactions />
          </Suspense>
        </div>

        {/* Kolom kanan — di mobile stacked setelah kiri */}
        <div className="md:sticky md:top-10">
          <Suspense fallback={<ListSkeleton rows={2} />}>
            <DashboardGoals />
          </Suspense>
        </div>
      </div>

      {/* FAB — mobile only */}
      <QuickAdd />
    </>
  );
}