"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leaveCouple } from "@/actions/couples";
import { logout } from "@/actions/auth";
import { toast } from "sonner";
import { LogOut, AlertTriangle } from "lucide-react";

export function DangerZone() {
  const router  = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function handleLeave() {
    if (!confirm(
      "Keluar dari couple ini?\n\n" +
      "Data kamu (transaksi, dompet, goals) akan kembali jadi milik pribadi dan tetap bisa diakses."
    )) return;

    setLeaving(true);
    const result = await leaveCouple();
    setLeaving(false);

    if (!result.success) return toast.error(result.error);

    toast.success("Kamu telah keluar dari couple. Data kamu tetap aman.");
    router.push("/dashboard");
  }

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
        Lainnya
      </h2>

      <div className="space-y-2">
        {/* logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-stone-50 transition-colors group"
        >
          <LogOut className="w-4 h-4 text-stone-400 group-hover:text-stone-600" />
          <span className="text-sm font-medium text-stone-600">Keluar Akun</span>
        </button>

        <div className="h-px bg-stone-50" />

        {/* leave couple */}
        <button
          onClick={handleLeave}
          disabled={leaving}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-red-50 transition-colors group disabled:opacity-50"
        >
          <AlertTriangle className="w-4 h-4 text-red-300 group-hover:text-red-400" />
          <span className="text-sm font-medium text-red-400 group-hover:text-red-500">
            {leaving ? "Memproses..." : "Keluar dari Couple"}
          </span>
        </button>
      </div>
    </div>
  );
}