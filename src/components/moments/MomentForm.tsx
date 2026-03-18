"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createMoment } from "@/actions/moments";
import { uploadToCloudinary, UploadError } from "@/lib/uploadToCloudinary";
import { toast } from "sonner";
import { Camera, Upload, X, Calendar, Link as LinkIcon, Heart } from "lucide-react";
import type { Transaction } from "@/actions/transactions";

interface Props {
  recentTransactions: Transaction[];
}

export function MomentForm({ recentTransactions }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPreview(null);
    setImageFile(null);
  };

  const handleClose = () => {
    setOpen(false);
    clearImage();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageFile) return toast.error("Pilih foto dulu ya, Kak!");
    setLoading(true);

    // ✅ Capture SEBELUM await apapun
    const fd = new FormData(e.currentTarget);

    try {
      const imageUrl = await uploadToCloudinary(imageFile, "moments");

      const result = await createMoment({
        imageUrl,
        caption:       (fd.get("caption") as string) || null,
        transactionId: fd.get("transactionId") ? Number(fd.get("transactionId")) : null,
        date:          fd.get("date") ? new Date(fd.get("date") as string) : new Date(),
      });

      if (!result.success) throw new Error(result.error);

      toast.success("Momen indah berhasil disimpan! 💕");
      handleClose();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof UploadError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(var(--bottom-nav-h,72px)+20px)] right-5 z-40 w-16 h-16 rounded-full text-white flex items-center justify-center active:scale-90 transition-all group shadow-lg"
        style={{
          background: "linear-gradient(135deg, var(--accent-400), var(--accent-600))",
          boxShadow: "var(--shadow-accent)",
        }}
      >
        <Camera className="w-7 h-7 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-end justify-center sm:items-center p-0 pb-[88px] sm:p-4">
      <div className="absolute inset-0 -z-10" onClick={handleClose} />

      <div className="w-[calc(100%-2rem)] mx-4 max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-500 max-h-[92dvh] flex flex-col shadow-2xl">

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* Image Upload */}
          <div className="relative w-full aspect-[4/3] bg-stone-50 border-b border-stone-100">
            {preview ? (
              <div className="relative h-full w-full animate-in zoom-in-95 duration-300">
                <img src={preview} alt="preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-full w-full flex flex-col items-center justify-center gap-3 cursor-pointer group p-10 text-center transition-all active:bg-stone-100"
              >
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-all duration-300"
                  style={{ background: "var(--accent-50)", color: "var(--accent-400)" }}
                >
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-stone-800 font-bold tracking-tight">Abadikan Momen</p>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">Ketuk untuk memilih foto kenanganmu.</p>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {/* Form */}
          <form id="moment-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" style={{ color: "var(--accent-500)", fill: "var(--accent-500)" }} />
              <h3 className="font-bold text-xl text-stone-800 tracking-tight">Detail Momen</h3>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1">
                Kisah di Balik Foto
              </label>
              <textarea
                name="caption"
                rows={3}
                placeholder="Ceritakan sedikit tentang hari ini... 💕"
                className="w-full bg-stone-50 rounded-2xl px-5 py-4 text-sm text-stone-700 border border-transparent transition-all outline-none resize-none placeholder-stone-300 shadow-inner focus:bg-white focus:ring-4 focus:ring-stone-100 focus:border-stone-200"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" /> Tanggal
              </label>
              <input
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full bg-stone-50 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 border border-stone-100 outline-none"
              />
            </div>

            {/* Linked Transaction */}
            {recentTransactions.length > 0 && (
              <div className="space-y-2 pb-4">
                <label className="text-[11px] font-bold text-stone-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <LinkIcon className="w-3 h-3" /> Tautkan Pengeluaran
                </label>
                <select
                  name="transactionId"
                  className="w-full bg-stone-50 rounded-xl pl-4 pr-10 py-3.5 text-xs font-medium text-stone-600 border border-stone-100 outline-none appearance-none"
                >
                  <option value="">Tidak ada transaksi terkait</option>
                  {recentTransactions.map((tx) => (
                    <option key={tx.id} value={tx.id}>
                      {tx.category} — Rp {tx.amount.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="p-6 bg-white border-t border-stone-50 shadow-[0_-15px_30px_-5px_rgba(0,0,0,0.05)] z-10">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-4 bg-stone-100 text-stone-500 rounded-2xl text-sm font-bold active:scale-95 transition-all hover:bg-stone-200 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              form="moment-form"
              disabled={loading || !imageFile}
              className="flex-[2] py-4 text-white rounded-2xl text-sm font-bold disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, var(--accent-400), var(--accent-600))",
                boxShadow: "var(--shadow-accent)",
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Simpan Kenangan 💕</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}