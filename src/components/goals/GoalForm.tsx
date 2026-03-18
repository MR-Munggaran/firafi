"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGoal } from "@/actions/goals";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const EMOJIS = ["🎯", "✈️", "🏠", "🚗", "💍", "📱", "👶", "🎓", "💼", "🌴", "🎮", "💎"];

export function GoalForm() {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [emoji, setEmoji]     = useState("🎯");

  function handleClose() { setOpen(false); setEmoji("🎯"); }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd           = new FormData(e.currentTarget);
    const targetDateRaw = fd.get("targetDate") as string;
    const result = await createGoal({
      name:         fd.get("name") as string,
      targetAmount: Number(fd.get("targetAmount")),
      targetDate:   targetDateRaw ? new Date(targetDateRaw) : null,
      emoji,
    });
    setLoading(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Target baru dibuat! 🎯");
    handleClose();
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-4 rounded-3xl border-2 border-dashed text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        style={{ borderColor: "var(--accent-100)", color: "var(--accent-400)" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-50)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
      >
        <Plus className="w-4 h-4" /> Tambah Target Baru
      </button>
    );
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden animate-slide-up" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* preview emoji */}
      <div
        className="h-24 flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, var(--accent-50), var(--accent-100))" }}
      >
        <span className="text-5xl">{emoji}</span>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-stone-800">Target Baru</h3>
          <button type="button" onClick={handleClose} className="text-stone-300 hover:text-stone-500 text-sm transition-colors">Batal</button>
        </div>

        {/* pilih emoji */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Ikon</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                style={emoji === e
                  ? { background: "var(--accent-100)", boxShadow: `0 0 0 2px var(--accent-400)` }
                  : { background: "#f5f5f4" }
                }
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* nama target */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1.5">Nama Target</label>
          <input
            name="name" type="text" required
            placeholder="Contoh: Liburan ke Jepang"
            className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm text-stone-700 outline-none placeholder-stone-300 transition-all"
            onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-200, var(--accent-100))"; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = ""; }}
          />
        </div>

        {/* target nominal */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1.5">Jumlah Target</label>
          <div
            className="flex items-center bg-stone-50 rounded-xl px-4 py-3 gap-2 transition-all"
            onFocusCapture={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-200, var(--accent-100))"; }}
            onBlurCapture={(e) => { e.currentTarget.style.boxShadow = ""; }}
          >
            <span className="text-stone-300 font-display text-xl">Rp</span>
            <input name="targetAmount" type="number" required min={1} placeholder="0" className="flex-1 bg-transparent font-display text-xl font-semibold text-stone-800 focus:outline-none placeholder-stone-200" />
          </div>
        </div>

        {/* target date */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1.5">
            Target Tanggal <span className="text-stone-300 normal-case font-normal">(opsional)</span>
          </label>
          <input
            name="targetDate" type="date"
            className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm text-stone-700 outline-none transition-all"
            onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-200, var(--accent-100))"; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = ""; }}
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="w-full py-3.5 text-white rounded-2xl text-sm font-semibold disabled:opacity-60 active:scale-[0.98] transition-all"
          style={{ background: "var(--accent-500)", boxShadow: "var(--shadow-accent)" }}
        >
          {loading ? "Menyimpan..." : "Buat Target 🎯"}
        </button>
      </form>
    </div>
  );
}
