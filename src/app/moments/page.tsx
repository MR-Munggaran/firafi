import { getMoments } from "@/actions/moments";
import { getCoupleMembers } from "@/actions/users";
import { getTransactions } from "@/actions/transactions";
import { PageHeader } from "@/components/layout/PageHeader";
import { MomentCard } from "@/components/moments/MomentCard";
import { MomentForm } from "@/components/moments/MomentForm";

export default async function MomentsPage() {
  const [momentsRes, membersRes, transactionsRes] = await Promise.allSettled([
    getMoments(),
    getCoupleMembers(),                              // v2: getUsers() → getCoupleMembers()
    getTransactions({ limit: 30, type: "expense" }),
  ]);

  const moments      = momentsRes.status      === "fulfilled" ? momentsRes.value      : [];
  const members      = membersRes.status      === "fulfilled" ? membersRes.value      : [];
  const transactions = transactionsRes.status === "fulfilled" ? transactionsRes.value : [];

  return (
    <>
      <PageHeader
        title="Galeri Momen"
        subtitle={`${moments.length} kenangan bersama`}
        emoji="📸"
      />

      {moments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div
            className="w-24 h-24 rounded-3xl mb-5 flex items-center justify-center text-4xl"
            style={{ background: "linear-gradient(135deg, #fff1f2, #fce7f3)" }}
          >
            📸
          </div>
          <h2 className="font-display text-2xl font-semibold text-stone-700 mb-2">
            Belum ada momen
          </h2>
          <p className="text-sm text-stone-400 max-w-[200px] leading-relaxed">
            Abadikan kenangan indah kalian bersama di sini
          </p>
          <div className="mt-6 flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-rose-200"
                style={{ opacity: 1 - i * 0.25 }}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* 2-kolom grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {moments.map((moment, i) => (
              <div
                key={moment.id}
                className="animate-slide-up"
                style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
              >
                <MomentCard moment={moment} />
              </div>
            ))}
          </div>

          <p className="text-center text-stone-300 italic mb-6 font-display text-sm">
            &quot;Every moment with you is a memory worth keeping 💕&quot;
          </p>
        </>
      )}

      {/* FAB kamera — floating */}
      <MomentForm members={members} recentTransactions={transactions} />
    </>
  );
}