"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deleteMoment } from "@/actions/moments";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { X, Heart, Trash2 } from "lucide-react";
import type { MomentWithRelations } from "@/actions/moments";

export function MomentCard({ moment }: { moment: MomentWithRelations }) {
  const router = useRouter();
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);

  async function handleDelete() {
    if (!confirm("Hapus momen ini?")) return;
    setBusy(true);
    const result = await deleteMoment(moment.id);
    setBusy(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Momen dihapus");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      {/* grid thumbnail */}
      <button
        onClick={() => setOpen(true)}
        className="relative aspect-square rounded-2xl overflow-hidden group focus:outline-none w-full"
      >
        <Image
          src={moment.imageUrl}
          alt={moment.caption ?? "Momen"}
          fill
          sizes="(max-width: 480px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* overlay gradient + caption hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* schema v2: caption (bukan title) */}
        {moment.caption && (
          <p className="absolute bottom-0 left-0 right-0 px-2.5 py-2 text-white text-[11px] font-medium truncate translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            {moment.caption}
          </p>
        )}
      </button>

      {/* bottom sheet modal detail */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl overflow-hidden animate-slide-up max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* foto */}
            <div className="relative h-72 w-full">
              <Image
                src={moment.imageUrl}
                alt={moment.caption ?? "Momen"}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {/* caption + heart */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-display text-2xl font-semibold text-stone-800 leading-tight">
                  {/* schema v2: caption sebagai "judul", date sebagai tanggal momen */}
                  {moment.caption ?? formatDate(moment.date ?? moment.createdAt)}
                </h3>
                <Heart className="w-5 h-5 text-rose-400 flex-shrink-0 mt-1 fill-rose-400" />
              </div>

              {/* uploader + tanggal */}
              <div className="flex items-center gap-2 mb-4">
                {/* schema v2: uploaderId → uploader relation */}
                <span className="text-[11px] text-stone-400 font-medium">
                  {moment.uploader?.name ?? "—"}
                </span>
                <span className="text-stone-200">·</span>
                {/* schema v2: moment.date (tanggal momen), moment.createdAt (upload) */}
                <span className="text-[11px] text-stone-400">
                  {formatDate(moment.date ?? moment.createdAt)}
                </span>
              </div>

              {/* linked transaction (opsional) */}
              {moment.transaction && (
                <div className="bg-rose-50 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
                  <span className="text-lg">
                    {moment.transaction.category.split(" ")[0]}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-stone-600">
                      {moment.transaction.category.split(" ").slice(1).join(" ")}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Terkait transaksi ini
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleDelete}
                disabled={busy}
                className="w-full py-3 rounded-2xl border border-red-100 text-red-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Momen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}