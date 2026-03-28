import Link from "next/link";
import { Plus } from "lucide-react";

export function QuickAdd() {
  return (
    // FAB hanya muncul di mobile — di desktop, aksi ada di halaman transaksi
    <Link
      href="/transactions/new"
      className="
        md:hidden
        fixed z-40
        bottom-[calc(var(--bottom-nav-h,64px)+env(safe-area-inset-bottom,0px)+12px)]
        right-4
        flex items-center justify-center
        text-white active:scale-95 transition-transform
        rounded-full
      "
      style={{
        width: "52px",
        height: "52px",
        background: "var(--accent-500)",
        boxShadow:  "var(--shadow-accent)",
      }}
      aria-label="Catat transaksi baru"
    >
      <Plus className="w-5 h-5" strokeWidth={2.5} />
    </Link>
  );
}