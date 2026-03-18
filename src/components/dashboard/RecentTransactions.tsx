import Link from "next/link";
import { formatCurrency, formatDateShort } from "@/lib/format";
import type { TransactionWithRelations } from "@/actions/transactions";

interface Props {
  transactions: TransactionWithRelations[];
}

function getCategoryEmoji(category: string) { return category.split(" ")[0] ?? "💸"; }
function getCategoryLabel(category: string) { return category.split(" ").slice(1).join(" ") || category; }

export function RecentTransactions({ transactions }: Props) {
  return (
    <section className="mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-semibold text-stone-700">Transaksi Terbaru</h2>
        <Link href="/transactions" className="text-xs font-medium" style={{ color: "var(--accent-400)" }}>
          Lihat semua →
        </Link>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        {transactions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-2xl mb-2">🧾</p>
            <p className="text-sm text-stone-400">Belum ada transaksi</p>
            <Link
              href="/transactions/new"
              className="inline-block mt-3 text-xs font-medium"
              style={{ color: "var(--accent-400)" }}
            >
              Catat transaksi pertama →
            </Link>
          </div>
        ) : (
          <ul>
            {transactions.map((tx, i) => {
              const isIncome = tx.type === "income";
              return (
                <li
                  key={tx.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i !== transactions.length - 1 ? "border-b border-stone-50" : ""}`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: isIncome ? "var(--accent-50)" : "#f0fdf4" }}
                  >
                    {getCategoryEmoji(tx.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate leading-tight">
                      {getCategoryLabel(tx.category)}
                    </p>
                    <p className="text-[11px] text-stone-400 leading-tight mt-0.5">
                      {tx.user.name} · {formatDateShort(tx.date)}
                    </p>
                  </div>
                  <p
                    className="text-sm font-semibold flex-shrink-0"
                    style={{ color: isIncome ? "#10b981" : "var(--accent-500)" }}
                  >
                    {isIncome ? "+" : "−"}{formatCurrency(Number(tx.amount), true)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
