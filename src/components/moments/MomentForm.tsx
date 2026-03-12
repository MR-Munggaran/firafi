"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createMoment } from "@/actions/moments";
import { toast } from "sonner";
import { Camera, Upload, X, Calendar, User, Link as LinkIcon, Heart } from "lucide-react";
import type { User as UserType } from "@/actions/users";
import type { Transaction } from "@/actions/transactions";

interface Props {
  members: UserType[];
  recentTransactions: Transaction[];
}

export function MomentForm({ members, recentTransactions }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleClose() {
    setOpen(false);
    setImageFile(null);
    setPreview(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!imageFile) return toast.error("Pilih foto dulu ya, Kak!");
    setLoading(true);

    const uploadForm = new FormData();
    uploadForm.append("file", imageFile);
    uploadForm.append("folder", "moments");
    
    try {
      const res = await fetch("/api/upload", { method: "POST", body: uploadForm });
      const data = await res.json() as { url?: string; error?: string };

      if (!data.url) throw new Error("Upload gagal");

      const fd = new FormData(e.currentTarget);
      const result = await createMoment({
        imageUrl: data.url,
        caption: (fd.get("caption") as string) || null,
        uploaderId: fd.get("uploaderId") as string,
        transactionId: fd.get("transactionId") ? Number(fd.get("transactionId")) : null,
        date: fd.get("date") ? new Date(fd.get("date") as string) : new Date(),
      });

      if (!result.success) throw new Error(result.error);

      toast.success("Momen indah berhasil disimpan! 💕");
      handleClose();
      router.refresh();
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : "Terjadi kesalahan";
      toast.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(var(--bottom-nav-h,72px)+20px)] right-5 z-40 w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center shadow-lg shadow-rose-200 hover:scale-110 active:scale-90 transition-all group"
      >
        <Camera className="w-7 h-7 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Overlay Close Area */}
      <div className="absolute inset-0 -z-10" onClick={handleClose} />

      <div className="w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500 max-h-[95dvh] flex flex-col shadow-2xl">
        
        {/* Visual Header / Upload Area */}
        <div className="relative w-full aspect-[4/3] bg-stone-50 border-b border-stone-100">
          {preview ? (
            <div className="relative h-full w-full animate-in zoom-in-95 duration-300">
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              <button
                type="button"
                onClick={() => { setPreview(null); setImageFile(null); }}
                className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-full w-full flex flex-col items-center justify-center gap-3 cursor-pointer group p-10 text-center transition-all active:bg-rose-50/50"
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:bg-rose-100 transition-all duration-300">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-stone-800 font-bold">Abadikan Momen</p>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">Ketuk untuk memilih foto kenanganmu <br/> hari ini bersama pasangan.</p>
              </div>
            </div>
          )}
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFile} className="hidden" />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* Header Text */}
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="font-bold text-xl text-stone-800 tracking-tight">Detail Momen</h3>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">Kisah di Balik Foto</label>
            <textarea
              name="caption"
              rows={3}
              placeholder="Ceritakan sedikit tentang hari ini... 💕"
              className="w-full bg-stone-50 rounded-2xl px-5 py-4 text-sm text-stone-700 focus:bg-white focus:ring-4 focus:ring-rose-50 focus:border-rose-200 border border-transparent transition-all outline-none resize-none placeholder-stone-300 shadow-inner"
            />
          </div>

          {/* Row: Date & Uploader */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Tanggal
              </label>
              <input
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 focus:bg-white border border-stone-100 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Oleh
              </label>
              <select 
                name="uploaderId" 
                className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 focus:bg-white border border-stone-100 outline-none transition-all appearance-none cursor-pointer"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Linked Transaction */}
          {recentTransactions.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <LinkIcon className="w-3 h-3" /> Tautkan Pengeluaran
              </label>
              <div className="relative group">
                <select
                  name="transactionId"
                  className="w-full bg-stone-50 rounded-xl pl-4 pr-10 py-3.5 text-xs font-medium text-stone-600 focus:bg-white border border-stone-100 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Tidak ada transaksi terkait</option>
                  {recentTransactions.map((tx) => (
                    <option key={tx.id} value={tx.id}>
                      {tx.category} — Rp {tx.amount.toLocaleString()}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-stone-300">
                  <X className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-4 bg-stone-100 text-stone-500 rounded-2xl text-sm font-bold hover:bg-stone-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !imageFile}
              className="flex-[2] py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-100 disabled:opacity-60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Simpan Kenangan 💕</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}