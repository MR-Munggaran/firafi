"use client";

import { useState } from "react";
import { createCouple, joinCouple } from "@/actions/auth";
import { AuthShell } from "@/app/login/page";


type Tab = "create" | "join";

export default function OnboardingPage() {
  const [tab, setTab]         = useState<Tab>("create");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await createCouple(new FormData(e.currentTarget));
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  async function handleJoin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await joinCouple(new FormData(e.currentTarget));
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  return (
    <AuthShell
      emoji="💌"
      title="Mulai Bersama"
      subtitle="Buat couple baru atau gabung dengan pasanganmu"
    >
      {/* Tab switcher */}
      <div
        className="flex bg-stone-100 rounded-2xl p-1 mb-5"
      >
        {(["create", "join"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200"
            style={
              tab === t
                ? {
                    background: "var(--accent-500, #f43f5e)",
                    color: "#fff",
                    boxShadow: "var(--shadow-accent)",
                  }
                : { color: "#a8a29e" }
            }
          >
            {t === "create" ? "Buat Couple" : "Gabung"}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl px-4 py-3 mb-4 text-center">
          {error}
        </div>
      )}

      {tab === "create" ? (
        <form onSubmit={handleCreate} className="space-y-3">
          <p className="text-xs text-stone-400 leading-relaxed px-1">
            Buat couple baru dan bagikan kode undangan ke pasanganmu. Kamu akan jadi{" "}
            <span className="font-semibold" style={{ color: "var(--accent-500)" }}>owner</span>.
          </p>

          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: "#f5f5f4" }}
          >
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
              Nama Couple
            </label>
            <input
              name="coupleName"
              type="text"
              required
              placeholder="mis. Rafi & Fitri 💕"
              className="w-full bg-transparent text-sm font-medium text-stone-700 focus:outline-none placeholder-stone-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white rounded-2xl text-sm font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-60"
            style={{
              background: "var(--accent-500, #f43f5e)",
              boxShadow: "var(--shadow-accent)",
            }}
          >
            {loading ? "Membuat..." : "Buat Couple 🎉"}
          </button>

          <InfoBox>
            Setelah membuat couple, kamu akan mendapat kode undangan untuk dibagikan ke pasanganmu.
          </InfoBox>
        </form>
      ) : (
        <form onSubmit={handleJoin} className="space-y-3">
          <p className="text-xs text-stone-400 leading-relaxed px-1">
            Masukkan kode undangan 6 karakter yang diberikan pasanganmu.
          </p>

          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: "#f5f5f4" }}
          >
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
              Kode Undangan
            </label>
            <input
              name="inviteCode"
              type="text"
              required
              maxLength={6}
              placeholder="ABC123"
              className="w-full bg-transparent text-sm font-bold text-stone-700 focus:outline-none placeholder-stone-300 uppercase tracking-[0.3em] font-mono"
              onChange={(e) => { e.target.value = e.target.value.toUpperCase(); }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white rounded-2xl text-sm font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-60"
            style={{
              background: "var(--accent-500, #f43f5e)",
              boxShadow: "var(--shadow-accent)",
            }}
          >
            {loading ? "Bergabung..." : "Gabung Couple 💌"}
          </button>

          <InfoBox>
            Minta pasanganmu membuat couple terlebih dahulu dan bagikan kode undangannya.
          </InfoBox>
        </form>
      )}
    </AuthShell>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl px-4 py-3"
      style={{ background: "var(--accent-50, #fff1f2)" }}
    >
      <p className="text-xs text-center leading-relaxed" style={{ color: "var(--accent-400)" }}>
        {children}
      </p>
    </div>
  );
}