"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateProfile } from "@/actions/users";
import { toast } from "sonner";
import { Camera, User } from "lucide-react";
import type { User as UserType } from "@/actions/users";

interface Props {
  user: UserType | null;
}

export function ProfileSection({ user }: Props) {
  const router = useRouter();
  const [loading, setLoading]     = useState(false);
  const [name, setName]           = useState(user?.name ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview]     = useState<string | null>(user?.avatarUrl ?? null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!name.trim()) return toast.error("Nama tidak boleh kosong");
    setLoading(true);

    let avatarUrl = user?.avatarUrl ?? null;

    if (avatarFile) {
      const form = new FormData();
      form.append("file", avatarFile);
      form.append("folder", "avatars");
      const res  = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json() as { url?: string };
      if (data.url) avatarUrl = data.url;
    }

    const result = await updateProfile({
      name: name.trim(),
      avatarUrl: avatarUrl ?? undefined,  // fix: updateProfile expects string|undefined, not null
    });
    setLoading(false);

    if (!result.success) return toast.error(result.error);
    toast.success("Profil diperbarui!");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
        Profil Saya
      </h2>

      {/* avatar */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-rose-50 flex items-center justify-center relative">
            {preview ? (
              <Image src={preview} alt="avatar" fill sizes="64px" className="object-cover" />
            ) : (
              <User className="w-7 h-7 text-rose-200" />
            )}
          </div>
          <label className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-rose-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-sm">
            <Camera className="w-3.5 h-3.5" />
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-700">{user?.name ?? "—"}</p>
          <p className="text-xs text-stone-400">{user?.email ?? "—"}</p>
        </div>
      </div>

      {/* nama */}
      <div className="mb-4">
        <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wide mb-1.5">
          Nama Tampilan
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
          placeholder="Nama kamu..."
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-3 bg-rose-500 text-white rounded-xl text-sm font-semibold disabled:opacity-60 active:scale-[0.98] transition-all"
      >
        {loading ? "Menyimpan..." : "Simpan Profil"}
      </button>
    </div>
  );
}