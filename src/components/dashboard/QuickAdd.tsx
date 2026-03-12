import Link from "next/link";
import { Plus } from "lucide-react";

export function QuickAdd() {
  return (
    <Link
      href="/transactions/new"
      className="fixed bottom-[calc(var(--bottom-nav-h,64px)+16px)] right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center bg-rose-500 text-white shadow-rose active:scale-95 transition-transform"
      aria-label="Catat transaksi baru"
    >
      <Plus className="w-6 h-6" strokeWidth={2.5} />
    </Link>
  );
}