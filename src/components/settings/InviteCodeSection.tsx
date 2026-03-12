"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { regenerateInviteCode } from "@/actions/couples";
import { toast } from "sonner";
import { Copy, RefreshCw, Check } from "lucide-react";

interface Props {
  inviteCode: string | null;
}

export function InviteCodeSection({ inviteCode }: Props) {
  const router = useRouter();
  const [copied, setCopied]   = useState(false);
  const [regen, setRegen]     = useState(false);
  const [code, setCode]       = useState(inviteCode ?? "");

  async function handleCopy() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Kode disalin!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegen() {
    if (!confirm("Kode lama akan tidak berlaku. Lanjutkan?")) return;
    setRegen(true);
    const result = await regenerateInviteCode();
    setRegen(false);
    if (!result.success) return toast.error(result.error);
    setCode(result.data.inviteCode);  // fix: result.data is {inviteCode:string}
    toast.success("Kode undangan diperbarui!");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
        Kode Undangan
      </h2>
      <p className="text-[11px] text-stone-400 mb-4">
        Bagikan ke pasangan untuk bergabung ke couple ini
      </p>

      {/* display kode */}
      <div className="flex items-center gap-3 bg-stone-50 rounded-2xl px-4 py-4 mb-3">
        <p className="flex-1 font-display text-3xl font-bold text-stone-800 tracking-[0.25em] text-center">
          {code || "——"}
        </p>
        <button
          onClick={handleCopy}
          className="w-9 h-9 rounded-xl bg-white shadow-card flex items-center justify-center text-stone-400 hover:text-rose-400 transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* regenerate */}
      <button
        onClick={handleRegen}
        disabled={regen}
        className="w-full py-2.5 rounded-xl border border-stone-100 text-stone-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${regen ? "animate-spin" : ""}`} />
        Buat Kode Baru
      </button>
    </div>
  );
}