"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deleteMoment } from "@/actions/moments";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import { Heart, Trash2 } from "lucide-react";
import type { MomentWithRelations } from "@/actions/moments";

export function MomentCard({ moment }: { moment: MomentWithRelations }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Hapus momen ini?")) return;
    setBusy(true);
    const result = await deleteMoment(moment.id);
    setBusy(false);
    if (!result.success) return toast.error(result.error);
    toast.success("Momen dihapus");
    router.refresh();
  }

  return (
    <div className="rounded-3xl overflow-hidden bg-white shadow-sm border border-stone-100 flex flex-col">
      {/* Image */}
      <div className="relative aspect-4/3 w-full">
        <Image
          src={moment.imageUrl}
          alt={moment.caption ?? "Momen"}
          fill
          sizes="(max-width: 480px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Caption */}
        {moment.caption && (
          <p className="text-sm font-semibold text-stone-700 leading-snug line-clamp-2">
            {moment.caption}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-stone-400">
              {moment.uploader?.name?.split(" ")[0] ?? "—"}
            </span>
            <span className="text-[10px] text-stone-300">
              {formatDate(moment.date ?? moment.createdAt)}
            </span>
          </div>
          <Heart
            className="w-4 h-4 shrink-0"
            style={{ color: "var(--accent-400)", fill: "var(--accent-400)" }}
          />
        </div>

        {/* Linked transaction */}
        {moment.transaction && (
          <div
            className="rounded-xl px-3 py-2 flex items-center gap-2 mt-0.5"
            style={{ background: "var(--accent-50)" }}
          >
            <span className="text-sm">{moment.transaction.category.split(" ")[0]}</span>
            <p className="text-[11px] font-medium text-stone-500 truncate">
              {moment.transaction.category.split(" ").slice(1).join(" ")}
            </p>
          </div>
        )}

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={busy}
          className="mt-auto pt-1.5 w-full flex items-center justify-center gap-1.5 text-[11px] font-medium text-red-300 hover:text-red-400 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3 h-3" />
          Hapus
        </button>
      </div>
    </div>
  );
}