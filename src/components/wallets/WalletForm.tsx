"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWallet } from "@/actions/wallets";
import { toast } from "sonner";
import { Plus, Wallet, Check, Users, User as UserIcon, X } from "lucide-react";
import type { User } from "@/actions/users";

const WALLET_TYPES = [
  { value: "cash", label: "Tunai", icon: "💵" },
  { value: "bank", label: "Bank", icon: "🏦" },
  { value: "ewallet", label: "E-Wallet", icon: "📱" },
  { value: "investment", label: "Investasi", icon: "📈" },
  { value: "other", label: "Lainnya", icon: "💼" },
] as const;

interface Props {
  members: User[];
  currentUser: User | null;
}

export function WalletForm({ members, currentUser }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletType, setWalletType] = useState<string>("cash");
  const [ownerId, setOwnerId] = useState<string>(currentUser?.id ?? "shared");

  const allMembers = [
    ...(currentUser ? [currentUser] : []),
    ...members.filter((m) => m.id !== currentUser?.id),
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const result = await createWallet({
      name: fd.get("name") as string,
      type: walletType,
      ownerId: ownerId === "shared" ? null : ownerId,
      balance: Number(fd.get("balance")) || 0,
      color: null,
    });

    setLoading(false);
    if (!result.success) return toast.error(result.error);

    toast.success("Dompet baru ditambahkan! 👛");
    setOpen(false);
    setWalletType("cash");
    setOwnerId(currentUser?.id ?? "shared");
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="group w-full py-4 rounded-3xl border-2 border-dashed border-rose-200 text-rose-400 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-rose-50 hover:border-rose-300 transition-all duration-300"
      >
        <div className="bg-rose-100 p-1 rounded-full group-hover:scale-110 transition-transform">
          <Plus className="w-4 h-4" />
        </div>
        Tambah Dompet Baru
      </button>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-rose-100/50 p-6 border border-rose-50 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-300 flex items-center justify-center shadow-lg shadow-rose-200">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-stone-800 leading-tight">Dompet Baru</h3>
            <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Atur sumber dana</p>
          </div>
        </div>
        <button 
          type="button" 
          onClick={() => setOpen(false)} 
          className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nama Dompet */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-stone-500 ml-1 uppercase tracking-widest">Nama Dompet</label>
          <input
            name="name"
            type="text"
            required
            placeholder="Misal: Tabungan Nikah, Jajan..."
            className="w-full bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3.5 text-sm text-stone-700 focus:bg-white focus:ring-4 focus:ring-rose-50 focus:border-rose-200 outline-none transition-all placeholder-stone-300"
          />
        </div>

        {/* Jenis Dompet - Grid Style */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-stone-500 ml-1 uppercase tracking-widest">Jenis Dompet</label>
          <div className="grid grid-cols-2 gap-2">
            {WALLET_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setWalletType(t.value)}
                className={`flex items-center gap-2 px-3 py-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                  walletType === t.value
                    ? "border-rose-500 bg-rose-50/50 text-rose-600 shadow-sm shadow-rose-100"
                    : "border-stone-50 bg-stone-50 text-stone-400 hover:border-stone-200"
                }`}
              >
                <span className="text-base">{t.icon}</span>
                {t.label}
                {walletType === t.value && <Check className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Pemilik - Avatar Style */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-stone-500 ml-1 uppercase tracking-widest">Pemilik</label>
          <div className="flex gap-2">
            {allMembers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setOwnerId(m.id)}
                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  ownerId === m.id
                    ? "border-rose-500 bg-rose-50/50 text-rose-600 shadow-sm shadow-rose-100"
                    : "border-stone-50 bg-stone-50 text-stone-400 hover:border-stone-200"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] ${ownerId === m.id ? 'bg-rose-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px] truncate w-full text-center font-bold">
                  {m.id === currentUser?.id ? 'Saya' : m.name.split(' ')[0]}
                </span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setOwnerId("shared")}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                ownerId === "shared"
                  ? "border-rose-500 bg-rose-50/50 text-rose-600 shadow-sm shadow-rose-100"
                  : "border-stone-50 bg-stone-50 text-stone-400 hover:border-stone-200"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ownerId === 'shared' ? 'bg-rose-500 text-white' : 'bg-stone-200 text-stone-500'}`}>
                <Users className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-center">Bersama</span>
            </button>
          </div>
        </div>

        {/* Saldo Awal */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[11px] font-bold text-stone-500 ml-1 uppercase tracking-widest">Saldo Saat Ini</label>
          <div className="relative flex items-center group">
            <span className="absolute left-4 text-stone-400 font-bold text-sm group-focus-within:text-rose-400 transition-colors">Rp</span>
            <input
              name="balance"
              type="number"
              min={0}
              placeholder="0"
              className="w-full bg-stone-900 text-white rounded-2xl pl-12 pr-4 py-4 text-2xl font-bold focus:ring-4 focus:ring-rose-100 outline-none transition-all placeholder-stone-600"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-[1.25rem] text-sm font-bold shadow-lg shadow-rose-200 hover:shadow-rose-300 disabled:opacity-60 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Simpan Dompet ✨</>
          )}
        </button>
      </form>
    </div>
  );
}