import { getWallets } from "@/actions/wallets";
import { getTransactions } from "@/actions/transactions";
import { getCoupleMembers, getCurrentUser } from "@/actions/users";
import { formatCurrency, formatMonth, getCurrentMonthYear } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { WalletCard } from "@/components/wallets/WalletCard";
import { WalletForm } from "@/components/wallets/WalletForm";

export default async function WalletsPage() {
  const { month, year } = getCurrentMonthYear();

  const [walletsRes, transactionsRes, membersRes, userRes] = await Promise.allSettled([
    getWallets(),
    getTransactions({ month, year, limit: 500 }),
    getCoupleMembers(),
    getCurrentUser(),
  ]);

  const wallets      = walletsRes.status      === "fulfilled" ? walletsRes.value      : [];
  const transactions = transactionsRes.status === "fulfilled" ? transactionsRes.value : [];
  const members      = membersRes.status      === "fulfilled" ? membersRes.value      : [];
  const currentUser  = userRes.status         === "fulfilled" ? userRes.value         : null;

  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);

  const statsByWallet = wallets.reduce<Record<number, { income: number; expense: number }>>((acc, w) => {
    acc[w.id] = { income: 0, expense: 0 };
    return acc;
  }, {});

  for (const tx of transactions) {
    const stat = statsByWallet[tx.walletId];
    if (!stat) continue;
    if (tx.type === "income")  stat.income  += Number(tx.amount);
    if (tx.type === "expense") stat.expense += Number(tx.amount);
  }

  const myWallets      = wallets.filter((w) => w.ownerId === currentUser?.id);
  const partnerWallets = wallets.filter((w) => w.ownerId && w.ownerId !== currentUser?.id);
  const sharedWallets  = wallets.filter((w) => !w.ownerId);
  const partnerName    = members.find((m) => m.id !== currentUser?.id)?.name ?? "Pasangan";

  const groups = [
    { label: "Dompet Saya",           emoji: "👤", list: myWallets      },
    { label: `Dompet ${partnerName}`, emoji: "💑", list: partnerWallets },
    { label: "Dompet Bersama",        emoji: "🤝", list: sharedWallets  },
  ].filter((g) => g.list.length > 0);

  return (
    <>
      <PageHeader title="Dompet" subtitle={`${wallets.length} dompet aktif`} emoji="👛" />

      {/* total saldo */}
      <div
        className="rounded-3xl p-5 mb-6 animate-slide-up relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1c1917 0%, #292524 100%)",
          boxShadow:  "0 8px 28px -4px rgba(28,25,23,0.30)",
        }}
      >
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 right-16 w-20 h-20 rounded-full bg-white/[0.03]" />
        <div className="relative z-10">
          <p className="text-stone-500 text-[11px] font-semibold uppercase tracking-widest mb-1">
            Total Semua Dompet
          </p>
          <p className="font-display text-4xl font-semibold text-white mb-2">
            {formatCurrency(totalBalance)}
          </p>
          <p className="text-stone-500 text-xs">
            {formatMonth(month, year)} · {wallets.length} dompet
          </p>
        </div>
      </div>

      {/* daftar dompet grouped */}
      {wallets.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-card py-16 text-center mb-5 animate-slide-up">
          <p className="text-4xl mb-3">👛</p>
          <p className="text-sm font-semibold text-stone-600 mb-1">Belum ada dompet</p>
          <p className="text-xs text-stone-400">Tambahkan dompet pertama kalian di bawah</p>
        </div>
      ) : (
        <div className="space-y-6 mb-5">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{group.emoji}</span>
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                  {group.label}
                </h2>
                <div className="flex-1 h-px bg-stone-100" />
                <span className="text-[11px] text-stone-300 font-medium">
                  {formatCurrency(group.list.reduce((s, w) => s + Number(w.balance), 0), true)}
                </span>
              </div>
              <div className="space-y-4">
                {group.list.map((wallet) => (
                  <div key={wallet.id} className="animate-slide-up">
                    <WalletCard
                      wallet={wallet}
                      index={wallets.indexOf(wallet)}
                      totalIncome={statsByWallet[wallet.id]?.income ?? 0}
                      totalExpense={statsByWallet[wallet.id]?.expense ?? 0}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* pass currentUser ke WalletForm supaya nama sendiri muncul */}
      <WalletForm members={members} currentUser={currentUser} />
    </>
  );
}