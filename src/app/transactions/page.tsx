import { Suspense } from "react";
import { getTransactions } from "@/actions/transactions";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { TransactionFilter } from "@/components/transactions/TransactionFilter";
import { QuickAdd } from "@/components/dashboard/QuickAdd";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function TransactionListSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-50 last:border-0">
          <div className="w-10 h-10 rounded-xl bg-stone-100 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-28 rounded-full bg-stone-100 animate-pulse" />
            <div className="h-3 w-40 rounded-full bg-stone-50 animate-pulse" />
          </div>
          <div className="h-4 w-16 rounded-full bg-stone-100 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default async function TransactionsPage({ searchParams }: Props) {
  const sp = await searchParams;

  const now     = new Date();
  const month   = Number(sp.month ?? now.getMonth() + 1);
  const year    = Number(sp.year  ?? now.getFullYear());
  const typeRaw = String(sp.type ?? "all");
  const type    = typeRaw === "income" || typeRaw === "expense" ? typeRaw : undefined;
  const sort    = sp.sort === "asc" ? "asc" : "desc";

  const rawTransactions = await getTransactions({ month, year, type, limit: 200 });

  // Sort berdasarkan createdAt — default terbaru dulu (desc)
  const transactions = [...rawTransactions].sort((a, b) => {
    const tA = new Date(a.createdAt).getTime();
    const tB = new Date(b.createdAt).getTime();
    return sort === "asc" ? tA - tB : tB - tA;
  });

  const income  = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const net = income - expense;

  return (
    <>
      <PageHeader
        title="Transaksi"
        subtitle="Semua pemasukan & pengeluaran"
        emoji="💸"
        action={
          /* Tombol tambah di desktop — FAB QuickAdd hanya di mobile */
          <Link
            href="/transactions/new"
            className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{
              background: "var(--accent-500)",
              boxShadow: "var(--shadow-accent)",
            }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Catat
          </Link>
        }
      />

      {/*
        Desktop: 2 kolom — kiri (filter sticky + list), kanan (summary card sticky)
        Mobile : 1 kolom, filter di atas
      */}
      <div className="md:grid md:grid-cols-[1fr_260px] lg:grid-cols-[1fr_280px] md:gap-6 lg:gap-8 md:items-start">

        {/* ── Kolom kiri ── */}
        <div>
          {/* Filter — sticky saat scroll di mobile & desktop */}
          <div className="sticky top-0 z-20 -mx-4 px-4 md:mx-0 md:px-0 pt-1 pb-3"
               style={{ background: "var(--bg, #fdf8f6)" }}>
            <Suspense>
              <TransactionFilter />
            </Suspense>
          </div>

          {/* Summary — hanya muncul di mobile, di bawah filter */}
          <div className="md:hidden grid grid-cols-3 gap-2 mb-4">
            <SummaryPill label="Masuk"   value={income}  color="emerald" />
            <SummaryPill label="Keluar"  value={expense} color="accent"  />
            <SummaryPill label="Selisih" value={net}     color={net >= 0 ? "emerald" : "accent"} prefix={net >= 0 ? "+" : "−"} abs />
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl overflow-hidden animate-slide-up mb-6"
               style={{ boxShadow: "var(--shadow-card)" }}>
            {transactions.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-3xl mb-2">🧾</p>
                <p className="text-sm text-stone-400 font-medium">Tidak ada transaksi</p>
                <p className="text-xs text-stone-300 mt-1">
                  Coba ubah filter atau catat transaksi baru
                </p>
                <Link
                  href="/transactions/new"
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                  style={{ background: "var(--accent-500)" }}
                >
                  <Plus className="w-3.5 h-3.5" /> Catat Sekarang
                </Link>
              </div>
            ) : (
              <ul>
                {transactions.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} />
                ))}
              </ul>
            )}
          </div>

          {/* Count info */}
          {transactions.length > 0 && (
            <p className="text-xs text-stone-300 text-center mb-6">
              {transactions.length} transaksi
            </p>
          )}
        </div>

        {/* ── Kolom kanan — summary card sticky (desktop only) ── */}
        <div className="hidden md:block md:sticky md:top-4">
          <div className="bg-white rounded-2xl p-5 space-y-4"
               style={{ boxShadow: "var(--shadow-card)" }}>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Ringkasan</p>

            <div className="space-y-3">
              <SummaryRow label="💰 Masuk"  value={income}  color="#10b981" />
              <SummaryRow label="💸 Keluar" value={expense} color="var(--accent-500)" />
              <div className="h-px bg-stone-50" />
              <SummaryRow
                label="📊 Selisih"
                value={Math.abs(net)}
                color={net >= 0 ? "#10b981" : "var(--accent-500)"}
                prefix={net >= 0 ? "+" : "−"}
                bold
              />
            </div>

            <Link
              href="/transactions/new"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white mt-2 transition-all active:scale-95"
              style={{ background: "var(--accent-500)", boxShadow: "var(--shadow-accent)" }}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Catat Transaksi
            </Link>
          </div>
        </div>
      </div>

      {/* FAB — mobile only */}
      <QuickAdd />
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function SummaryPill({
  label, value, color, prefix = "", abs = false,
}: {
  label: string; value: number; color: "emerald" | "accent"; prefix?: string; abs?: boolean;
}) {
  const isEmerald = color === "emerald";
  const bg     = isEmerald ? "bg-emerald-50 border-emerald-100"    : "border";
  const text   = isEmerald ? "text-emerald-600"                    : "";
  const numCol = isEmerald ? "text-emerald-700"                    : "";

  return (
    <div
      className={`rounded-xl px-3 py-2.5 border ${bg}`}
      style={!isEmerald ? { background: "var(--accent-50)", borderColor: "var(--accent-100)" } : {}}
    >
      <p className={`text-[9px] font-bold uppercase tracking-wide mb-0.5 ${isEmerald ? "text-emerald-500" : ""}`}
         style={!isEmerald ? { color: "var(--accent-500)" } : {}}>
        {label}
      </p>
      <p className={`font-display text-sm font-semibold leading-none ${numCol}`}
         style={!isEmerald ? { color: "var(--accent-600)" } : {}}>
        {prefix}{formatCurrency(abs ? Math.abs(value) : value, true)}
      </p>
    </div>
  );
}

function SummaryRow({
  label, value, color, prefix = "", bold = false,
}: {
  label: string; value: number; color: string; prefix?: string; bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-500">{label}</span>
      <span
        className={`text-sm ${bold ? "font-bold" : "font-semibold"}`}
        style={{ color }}
      >
        {prefix}{formatCurrency(value, true)}
      </span>
    </div>
  );
}