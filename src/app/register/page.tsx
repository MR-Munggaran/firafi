"use client";

import { useState } from "react";
import Link from "next/link";
import { registerWithEmail } from "@/actions/auth";
import { AuthShell, InputCard } from "@/app/login/page";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd       = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm  = fd.get("confirm") as string;

    if (password !== confirm) {
      setError("Password tidak cocok");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
      return;
    }

    const result = await registerWithEmail(fd);
    if (result?.error) setError(result.error);
    setLoading(false);
  }

  const fields = [
    { label: "Nama",                 name: "name",     type: "text",     placeholder: "Nama kamu"        },
    { label: "Email",                name: "email",    type: "email",    placeholder: "nama@email.com"   },
    { label: "Password",             name: "password", type: "password", placeholder: "min. 6 karakter"  },
    { label: "Konfirmasi Password",  name: "confirm",  type: "password", placeholder: "ulangi password"  },
  ] as const;

  return (
    <AuthShell
      emoji="✨"
      title="Buat Akun"
      subtitle="Mulai perjalanan finansial bersama"
      footer={
        <p className="text-center text-sm text-stone-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--accent-500, #f43f5e)" }}>
            Masuk
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl px-4 py-3 text-center">
            {error}
          </div>
        )}

        {fields.map(({ label, name, type, placeholder }) => (
          <InputCard
            key={name}
            label={label}
            name={name}
            type={type}
            placeholder={placeholder}
            focused={focused === name}
            onFocus={() => setFocused(name)}
            onBlur={() => setFocused(null)}
          />
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-white rounded-2xl text-sm font-bold tracking-wide transition-all active:scale-[0.98] disabled:opacity-60 mt-1"
          style={{
            background: "var(--accent-500, #f43f5e)",
            boxShadow: "var(--shadow-accent, 0 4px 20px rgba(244,63,94,0.25))",
          }}
        >
          {loading ? "Membuat akun..." : "Buat Akun →"}
        </button>
      </form>
    </AuthShell>
  );
}