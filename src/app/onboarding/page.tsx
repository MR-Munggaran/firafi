"use client";

import { useState } from "react";
import { createCouple, joinCouple } from "@/actions/auth";

type Tab = "create" | "join";

export default function OnboardingPage() {
  const [tab, setTab]       = useState<Tab>("create");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await createCouple(fd);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  async function handleJoin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await joinCouple(fd);
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-10"
      style={{ background: "linear-gradient(160deg, #fff1f2 0%, #fdf8f6 50%, #fce7f3 100%)" }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-4xl mb-2">💕</p>
        <h1 className="font-display text-3xl font-semibold text-stone-800">
          Mulai Bersama
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          Buat couple baru atau gabung dengan pasanganmu
        </p>
      </div>

      <div className="w-full max-w-sm">
        {/* Tab switcher */}
        <div className="flex bg-white rounded-2xl shadow-card p-1 mb-5">
          <button
            onClick={() => { setTab("create"); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "create"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            Buat Couple
          </button>
          <button
            onClick={() => { setTab("join"); setError(null); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === "join"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-stone-400 hover:text-stone-600"
            }`}
          >
            Gabung
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl px-4 py-3 mb-4 text-center">
            {error}
          </div>
        )}

        {/* ── Tab: Buat Couple ── */}
        {tab === "create" && (
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="bg-white rounded-2xl shadow-card px-4 py-4">
              <p className="text-xs text-stone-400 mb-3 leading-relaxed">
                Buat couple baru dan bagikan kode undangan ke pasanganmu.
                Kamu akan jadi <span className="font-semibold text-rose-400">owner</span>.
              </p>
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1">
                Nama Couple
              </label>
              <input
                name="coupleName"
                type="text"
                required
                placeholder="mis. Rafi & Fitri 💕"
                className="w-full bg-transparent text-sm text-stone-700 focus:outline-none placeholder-stone-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-rose-500 text-white rounded-2xl text-sm font-semibold shadow-rose disabled:opacity-60 active:scale-[0.98] transition-all"
            >
              {loading ? "Membuat..." : "Buat Couple 🎉"}
            </button>
          </form>
        )}

        {/* ── Tab: Gabung via Kode ── */}
        {tab === "join" && (
          <form onSubmit={handleJoin} className="space-y-3">
            <div className="bg-white rounded-2xl shadow-card px-4 py-4">
              <p className="text-xs text-stone-400 mb-3 leading-relaxed">
                Masukkan kode undangan 6 karakter yang diberikan pasanganmu.
              </p>
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1">
                Kode Undangan
              </label>
              <input
                name="inviteCode"
                type="text"
                required
                maxLength={6}
                placeholder="ABC123"
                className="w-full bg-transparent text-sm text-stone-700 focus:outline-none placeholder-stone-300 uppercase tracking-widest font-mono"
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-rose-500 text-white rounded-2xl text-sm font-semibold shadow-rose disabled:opacity-60 active:scale-[0.98] transition-all"
            >
              {loading ? "Bergabung..." : "Gabung Couple 💌"}
            </button>
          </form>
        )}

        {/* Info */}
        <div className="mt-6 bg-rose-50 rounded-2xl px-4 py-3">
          <p className="text-xs text-rose-400 text-center leading-relaxed">
            {tab === "create"
              ? "Setelah membuat couple, kamu akan mendapat kode undangan untuk dibagikan ke pasanganmu."
              : "Minta pasanganmu untuk membuat couple terlebih dahulu dan berbagi kode undangan."}
          </p>
        </div>
      </div>
    </div>
  );
}