import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getWallets } from "@/actions/wallets";
import { getCoupleMembers } from "@/actions/users";
import { TransactionForm } from "@/components/transactions/TransactionForm";

export default async function NewTransactionPage() {
  // getUsers() lama diganti getCoupleMembers() — hanya ambil anggota couple ini
  const [wallets, members] = await Promise.all([
    getWallets(),
    getCoupleMembers(),
  ]);

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/transactions"
          className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center text-stone-500 active:bg-stone-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-800 leading-tight">
            Catat Transaksi
          </h1>
          <p className="text-xs text-stone-400">Pemasukan atau pengeluaran baru</p>
        </div>
      </div>

      <TransactionForm wallets={wallets} members={members} defaultTemplate={null} />
    </>
  );
}