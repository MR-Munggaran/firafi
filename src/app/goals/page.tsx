import { getGoals } from "@/actions/goals";
import { formatCurrency, calcPercent } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalForm } from "@/components/goals/GoalForm";

export default async function GoalsPage() {
  const goals = await getGoals();

  // schema v2: savedAmount & targetAmount (string)
  const totalTarget  = goals.reduce((s, g) => s + Number(g.targetAmount), 0);
  const totalSaved   = goals.reduce((s, g) => s + Number(g.savedAmount), 0);
  const doneCount    = goals.filter((g) => Number(g.savedAmount) >= Number(g.targetAmount)).length;
  const ongoingCount = goals.filter((g) => g.status === "ongoing").length;
  const overallPct   = calcPercent(totalSaved, totalTarget);

  return (
    <>
      <PageHeader
        title="Target Kita"
        subtitle={`${goals.length} target · ${doneCount} tercapai`}
        emoji="🌟"
      />

      {/* summary card — hanya tampil kalau ada goals */}
      {goals.length > 0 && (
        <div
          className="relative overflow-hidden rounded-3xl p-5 mb-6 animate-slide-up"
          style={{
            background:  "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
            boxShadow:   "0 8px 28px -4px rgba(244,63,94,0.35)",
          }}
        >
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/5" />

          <div className="relative z-10">
            <p className="text-pink-100 text-[11px] font-semibold uppercase tracking-widest mb-1">
              Total Tabungan Impian
            </p>
            <p className="font-display text-3xl font-semibold text-white mb-3">
              {formatCurrency(totalSaved)}
            </p>

            <div className="h-2 bg-white/25 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${Math.min(overallPct, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-pink-100 text-xs">
                dari {formatCurrency(totalTarget, true)}
              </p>
              <p className="text-white text-xs font-semibold">
                {overallPct}% tersimpan
              </p>
            </div>
          </div>
        </div>
      )}

      {/* list goals */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-card py-16 text-center mb-5 animate-slide-up">
          <p className="text-4xl mb-3">🌟</p>
          <p className="text-sm font-semibold text-stone-600 mb-1">
            Belum ada target impian
          </p>
          <p className="text-xs text-stone-400">
            Buat target pertama kalian di bawah!
          </p>
        </div>
      ) : (
        <div className="space-y-4 mb-5">
          {goals.map((goal) => (
            <div key={goal.id} className="animate-slide-up">
              <GoalCard goal={goal} />
            </div>
          ))}
        </div>
      )}

      <GoalForm />
    </>
  );
}