"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateCoupleName } from "@/actions/couples";
import { toast } from "sonner";
import { Heart, Pencil, Check, X, Crown, User } from "lucide-react";
import type { Couple, CoupleMember } from "@/actions/couples";

interface Props {
  couple:  (Couple & { members: CoupleMember[] }) | null;
  members: CoupleMember[];
}

export function CoupleSection({ couple, members }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(couple?.name ?? "");
  const [busy, setBusy]       = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setBusy(true);
    const result = await updateCoupleName(name.trim());
    setBusy(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Nama couple diperbarui!");
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
        Couple Kami
      </h2>

      {/* nama couple + edit */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-rose-50 rounded-xl">
        <Heart className="w-5 h-5 text-rose-400 fill-rose-400 flex-shrink-0" />
        {editing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="flex-1 bg-white rounded-lg px-3 py-1.5 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button
              onClick={handleSave}
              disabled={busy}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setEditing(false); setName(couple?.name ?? ""); }}
              className="p-1.5 rounded-lg bg-stone-50 text-stone-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <span className="flex-1 text-sm font-semibold text-stone-700">
              {couple?.name ?? "Couple Kami"}
            </span>
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-stone-300 hover:text-rose-400 hover:bg-rose-100 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* list member — CoupleMember: role di m, user info di m.user */}
      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.userId} className="flex items-center gap-3 py-2">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-stone-100 flex items-center justify-center flex-shrink-0">
              {m.user.avatarUrl ? (
                <Image
                  src={m.user.avatarUrl}
                  alt={m.user.name}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-stone-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-700 truncate">{m.user.name}</p>
              <p className="text-[11px] text-stone-400 truncate">{m.user.email}</p>
            </div>
            {/* role ada di CoupleMember (m), bukan m.user */}
            {m.role === "owner" ? (
              <div className="flex items-center gap-1 bg-amber-50 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Crown className="w-2.5 h-2.5" />
                Owner
              </div>
            ) : (
              <span className="bg-stone-50 text-stone-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Partner
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}