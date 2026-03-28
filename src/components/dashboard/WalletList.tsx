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
        <h2 className="font-display text-base md:text-lg font-semibold text-stone-700">
          Dompet
        </h2>
        <Link
          href="/wallets"
          className="text-xs font-medium"
          style={{ color: "var(--accent-400)" }}
        >
          Lihat semua →
        </Link>
      </div>

      {wallets.length === 0 ? (
        <Link
          href="/wallets"
          className="flex items-center justify-center h-24 rounded-2xl border-2 border-dashed"
          style={{ borderColor: "var(--accent-200, #fecdd3)" }}
        >
          <span className="text-xs font-medium" style={{ color: "var(--accent-300, #fda4af)" }}>
            + Tambah dompet
          </span>
        </Link>
      ) : (
        <>
          {/* ── Mobile: horizontal scroll carousel ── */}
          <div className="md:hidden -mx-4 px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {wallets.map((wallet, i) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  gradient={GRADIENTS[i % GRADIENTS.length]}
                  mobile
                />
              ))}
            </div>
          </div>

          {/* ── Desktop: 2-col grid ── */}
          <div className="hidden md:grid md:grid-cols-2 gap-3">
            {wallets.map((wallet, i) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                gradient={GRADIENTS[i % GRADIENTS.length]}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function WalletCard({
  wallet,
  gradient,
  mobile = false,
}: {
  wallet: WalletWithOwner;
  gradient: string;
  mobile?: boolean;
}) {
  return (
    <div
      className={`
        rounded-2xl p-4 relative overflow-hidden
        bg-gradient-to-br ${gradient}
        ${mobile ? "flex-shrink-0 w-44 snap-start" : "w-full"}
      `}
    >
      {/* ornamen */}
      <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-4 -left-2 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />

      <p className="text-white/75 text-[10px] font-medium tracking-widest uppercase mb-1 relative z-10">
        {wallet.owner?.name ?? "Bersama"}
      </p>
      <p className="text-white font-semibold text-sm mb-3 relative z-10 truncate">
        {wallet.name}
      </p>
      <p className="text-white font-display text-lg font-semibold leading-none relative z-10">
        {formatCurrency(Number(wallet.balance), true)}
      </p>
    </div>
  );
}