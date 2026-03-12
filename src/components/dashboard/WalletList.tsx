import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { WalletWithOwner } from "@/actions/wallets";

interface Props {
  wallets: WalletWithOwner[];
}

const GRADIENTS = [
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-blue-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
];

export function WalletList({ wallets }: Props) {
  return (
    <section className="mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-semibold text-stone-700">Dompet</h2>
        <Link href="/wallets" className="text-xs text-rose-400 font-medium">
          Lihat semua →
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {wallets.length === 0 ? (
          <Link
            href="/wallets"
            className="flex-shrink-0 w-40 h-24 rounded-2xl border-2 border-dashed border-rose-200 flex items-center justify-center"
          >
            <span className="text-xs text-rose-300 font-medium">+ Tambah dompet</span>
          </Link>
        ) : (
          wallets.map((wallet, i) => (
            <div
              key={wallet.id}
              className={`flex-shrink-0 w-44 rounded-2xl p-4 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} relative overflow-hidden`}
            >
              <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10" />
              <p className="text-white/80 text-[10px] font-medium tracking-wide uppercase mb-1 relative z-10">
                {wallet.owner?.name ?? "Bersama"}
              </p>
              <p className="text-white font-semibold text-sm mb-2 relative z-10 truncate">
                {wallet.name}
              </p>
              <p className="text-white font-display text-lg font-semibold leading-none relative z-10">
                {formatCurrency(Number(wallet.balance), true)}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}