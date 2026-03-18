import { Suspense } from "react";
import { getTransactions } from "@/actions/transactions";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { TransactionFilter } from "@/components/transactions/TransactionFilter";
import { QuickAdd } from "@/components/dashboard/QuickAdd";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TransactionsPage({ searchParams }: Props) {
  const sp = await searchParams;

  const now   = new Date();
  const month = Number(sp.month ?? now.getMonth() + 1);
  const year  = Number(sp.year  ?? now.getFullYear());
  const typeRaw = String(sp.type ?? "all");
  const type  = typeRaw === "income" || typeRaw === "expense" ? typeRaw : undefined;

  const transactions = await getTransactions({ month, year, type, limit: 200 });

  const income  = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  return (
    <>
      <PageHeader
        title="Transaksi"
        subtitle="Semua pemasukan & pengeluaran"
        emoji="💸"
      />

      <Suspense>
        <TransactionFilter />
      </Suspense>

      {/* ringkasan — income tetap emerald (semantik), expense pakai tema */}
      <div className="grid grid-cols-2 gap-3 mb-5 animate-slide-up">
        <div className="bg-emerald-50 rounded-2xl px-4 py-3 border border-emerald-100">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">
            Masuk
          </p>
          <p className="font-display text-lg font-semibold text-emerald-700">
            {formatCurrency(income)}
          </p>
        </div>
        <div
          className="rounded-2xl px-4 py-3 border"
          style={{ background: "var(--accent-50)", borderColor: "var(--accent-100)" }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-wide mb-0.5"
            style={{ color: "var(--accent-500)" }}
          >
            Keluar
          </p>
          <p className="font-display text-lg font-semibold" style={{ color: "var(--accent-600)" }}>
            {formatCurrency(expense)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden animate-slide-up mb-6" style={{ boxShadow: "var(--shadow-card)" }}>
        {transactions.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-3xl mb-2">🧾</p>
            <p className="text-sm text-stone-400 font-medium">Tidak ada transaksi</p>
            <p className="text-xs text-stone-300 mt-1">
              Coba ubah filter atau catat transaksi baru
            </p>
          </div>
        ) : (
          <ul>
            {transactions.map((tx) => (
              <TransactionItem key={tx.id} tx={tx} />
            ))}
          </ul>
        )}
      </div>

      <QuickAdd />
    </>
  );
}
