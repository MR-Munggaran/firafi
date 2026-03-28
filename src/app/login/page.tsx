"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { loginWithEmail } from "@/actions/auth";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
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

  return (
    <div className="w-full max-w-sm">
      {(urlError || error) && (
        <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl px-4 py-3 mb-5 text-center">
          {error ?? "Login gagal. Silakan coba lagi."}
        </div>
      )}

      <form onSubmit={handleEmail} className="space-y-3">
        <InputCard
          label="Email"
          name="email"
          type="email"
          placeholder="nama@email.com"
          focused={focused === "email"}
          onFocus={() => setFocused("email")}
          onBlur={() => setFocused(null)}
        />
        <InputCard
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          focused={focused === "password"}
          onFocus={() => setFocused("password")}
          onBlur={() => setFocused(null)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-white rounded-2xl text-sm font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-60 mt-1"
          style={{
            background: "var(--accent-500, #f43f5e)",
            boxShadow: "var(--shadow-accent, 0 4px 20px rgba(244,63,94,0.25))",
          }}
        >
          {loading ? "Memuat..." : "Masuk →"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      emoji="💕"
      title="Firafi"
      subtitle="Kelola keuangan bersama pasangan"
      footer={
        <p className="text-center text-sm text-stone-400">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold" style={{ color: "var(--accent-500, #f43f5e)" }}>
            Daftar sekarang
          </Link>
        </p>
      }
    >
      <Suspense fallback={<FormSkeleton rows={2} />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

export function AuthShell({
  emoji, title, subtitle, children, footer,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="
        min-h-dvh flex flex-col items-center justify-center px-5 py-12
        bg-[linear-gradient(150deg,#fff1f2_0%,#fdf8f6_45%,#fce7f3_100%)]
        md:bg-none
      "
    >
      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
           style={{ background: "radial-gradient(circle, var(--accent-300, #fda4af), transparent)", transform: "translate(-30%, -30%)" }} />
      <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
           style={{ background: "radial-gradient(circle, var(--accent-400, #fb7185), transparent)", transform: "translate(30%, 30%)" }} />

      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Branding */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg"
            style={{ background: "var(--accent-500, #f43f5e)", boxShadow: "var(--shadow-accent)" }}
          >
            {emoji}
          </div>
          <h1 className="font-display text-3xl font-semibold text-stone-800">{title}</h1>
          <p className="text-stone-400 text-sm mt-1">{subtitle}</p>
        </div>

        {/* Card */}
        <div
          className="w-full bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl"
          style={{ border: "1px solid rgba(255,255,255,0.8)" }}
        >
          {children}
        </div>

        {footer && <div className="mt-5 w-full">{footer}</div>}
      </div>
    </div>
  );
}

export function InputCard({
  label, name, type, placeholder, focused, onFocus, onBlur, required = true,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  required?: boolean;
}) {
  return (
    <div
      className="rounded-2xl px-4 py-3 transition-all duration-200"
      style={{
        background: focused ? "var(--accent-50, #fff1f2)" : "#f5f5f4",
        border: `1.5px solid ${focused ? "var(--accent-200, #fecdd3)" : "transparent"}`,
      }}
    >
      <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full bg-transparent text-sm font-medium text-stone-700 focus:outline-none placeholder-stone-300"
      />
    </div>
  );
}

function FormSkeleton({ rows }: { rows: number }) {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 rounded-2xl bg-stone-100 animate-pulse" />
      ))}
      <div className="h-14 rounded-2xl bg-stone-100 animate-pulse" />
    </div>
  );
}