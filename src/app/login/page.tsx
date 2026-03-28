"use client";

import { useState, Suspense } from "react"; // Tambahkan Suspense
import Link from "next/link";
import { loginWithEmail, loginWithGoogle } from "@/actions/auth";
import { useSearchParams } from "next/navigation";

// Pisahkan isi form ke komponen tersendiri
function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await loginWithEmail(fd);
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    await loginWithGoogle();
  }

  return (
    <div className="w-full max-w-sm">
      {urlError && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl px-4 py-3 mb-4 text-center">
          Login gagal. Silakan coba lagi.
        </div>
      )}

      {/* <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-sm font-semibold text-stone-700 shadow-card hover:shadow-card-md hover:border-stone-300 transition-all disabled:opacity-60 mb-4"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Masuk dengan Google
      </button> */}

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-stone-100" />
        <span className="text-xs text-stone-300 font-medium">atau</span>
        <div className="flex-1 h-px bg-stone-100" />
      </div>

      <form onSubmit={handleEmail} className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl px-4 py-3 text-center">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card px-4 py-3">
          <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="nama@email.com"
            className="w-full bg-transparent text-sm text-stone-700 focus:outline-none placeholder-stone-300"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-card px-4 py-3">
          <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full bg-transparent text-sm text-stone-700 focus:outline-none placeholder-stone-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-rose-500 text-white rounded-2xl text-sm font-semibold shadow-rose disabled:opacity-60 active:scale-[0.98] transition-all"
        >
          {loading ? "Memuat..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}

// Komponen Utama
export default function LoginPage() {
  return (
    <div 
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-10"
      style={{ background: "linear-gradient(160deg, #fff1f2 0%, #fdf8f6 50%, #fce7f3 100%)" }}
    >
      <div className="text-center mb-8">
        <p className="text-4xl mb-2">💕</p>
        <h1 className="font-display text-3xl font-semibold text-stone-800">Firafi</h1>
        <p className="text-stone-400 text-sm mt-1">Kelola keuangan bersama</p>
      </div>

      {/* Bungkus dengan Suspense untuk memperbaiki error prerendering */}
      <Suspense fallback={<p className="text-stone-400 text-sm">Memuat halaman...</p>}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-stone-400 mt-5">
        Belum punya akun?{" "}
        <Link href="/register" className="text-rose-500 font-semibold">
          Daftar
        </Link>
      </p>
    </div>
  );
}