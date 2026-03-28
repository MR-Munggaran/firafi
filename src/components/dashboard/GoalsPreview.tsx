import Link from "next/link";
import { formatCurrency, calcPercent } from "@/lib/format";
import type { Goal } from "@/actions/goals";

interface Props {
  goals: Goal[];
}

export function GoalsPreview({ goals }: Props) {
  const activeGoals = goals.filter((g) => g.status === "ongoing").slice(0, 3);
  if (activeGoals.length === 0) return null;

  return (
    <section className="mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-base sm:text-lg font-semibold text-stone-700">Target Kita 🌟</h2>
        <Link href="/goals" className="text-xs text-rose-400 font-medium">
          Lihat semua →
        </Link>
      </div>

      <div className="space-y-3">
        {activeGoals.map((goal) => {
          const saved  = Number(goal.savedAmount);
          const target = Number(goal.targetAmount);
          const pct    = calcPercent(saved, target);
          const done   = pct >= 100;

          return (
            <div
              key={goal.id}
              className="bg-white rounded-2xl p-3 sm:p-4 shadow-card flex items-center gap-3 sm:gap-4"
            >
              {/* emoji */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 text-xl sm:text-2xl">
                {goal.emoji ?? "🎯"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-stone-700 truncate">
                    {goal.name}
                  </p>
                  <span className={`text-xs font-semibold ml-2 flex-shrink-0 ${done ? "text-emerald-500" : "text-rose-400"}`}>
                    {done ? "✓" : `${pct}%`}
                  </span>
                </div>

                <div className="h-1.5 bg-rose-50 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${done ? "bg-emerald-400" : "bg-gradient-to-r from-rose-400 to-pink-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <p className="text-[11px] text-stone-400">
                  {formatCurrency(saved, true)}{" "}
                  <span className="text-stone-300">dari</span>{" "}
                  {formatCurrency(target, true)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}