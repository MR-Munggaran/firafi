import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getWallets } from "@/actions/wallets";
import { getCoupleMembers } from "@/actions/users";
import { getDefaultTemplate } from "@/actions/allocation";
import { TransactionForm } from "@/components/transactions/TransactionForm";

export default async function NewTransactionPage() {
  const [wallets, members, defaultTemplate] = await Promise.all([
    getWallets(),
    getCoupleMembers(),
    getDefaultTemplate().catch(() => null),
  ]);

  return (
    /*
      Di desktop, form tidak perlu full-width seperti list.
      Batasi ke max-w-lg agar tidak terlalu lebar dan tetap presisi.
    */
    <div className="max-w-lg mx-auto md:mx-0">
      {/* Back nav */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/transactions"
          className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-stone-500 transition-all active:bg-stone-50 active:scale-95"
          style={{ boxShadow: "var(--shadow-card)" }}
          aria-label="Kembali"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-800 leading-tight">
            Catat Transaksi
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">Pemasukan atau pengeluaran baru</p>
        </div>
      </div>

      <TransactionForm
        wallets={wallets}
        members={members}
        defaultTemplate={defaultTemplate}
      />
    </div>
  );
}