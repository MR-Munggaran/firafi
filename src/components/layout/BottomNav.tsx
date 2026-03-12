"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  Wallet,
  Camera,
  Settings,
  MoreHorizontal,
  LucideIcon
} from "lucide-react";

const MAIN_NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget", icon: PiggyBank },
  { href: "/goals", label: "Goals", icon: Target },
] as const;

const MORE_NAV = [
  { href: "/wallets", label: "Dompet", icon: Wallet },
  { href: "/moments", label: "Momen", icon: Camera },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Overlay untuk menutup dropup saat klik di luar */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      <nav
        aria-label="Navigasi utama"
        style={{ height: "var(--bottom-nav-h)" }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-rose-100 safe-bottom"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent" />

        {/* Dropup Menu */}
        <div className={`
          absolute bottom-full right-4 mb-2 min-w-[140px] 
          bg-white rounded-2xl shadow-xl border border-rose-50 overflow-hidden
          transition-all duration-300 origin-bottom-right
          ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-4 pointer-events-none"}
        `}>
          <div className="p-2 flex flex-col gap-1">
            {MORE_NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive(href) ? "bg-rose-50 text-rose-500" : "text-stone-600 active:bg-stone-50"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <ul className="flex h-full items-center justify-around px-2">
          {MAIN_NAV.map(({ href, label, icon: Icon }) => (
            <li key={href} className="flex-1">
              <NavItem href={href} label={label} icon={Icon} active={isActive(href)} />
            </li>
          ))}
          
          {/* Tombol More */}
          <li className="flex-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex flex-col items-center justify-center gap-0.5 py-1 w-full group"
            >
              <span className={`
                relative flex items-center justify-center w-10 h-7 rounded-full transition-all
                ${isOpen ? "bg-stone-100" : "bg-transparent"}
              `}>
                <MoreHorizontal 
                  className={`w-4 h-4 ${isOpen ? "text-rose-500" : "text-stone-400"}`} 
                />
              </span>
              <span className={`text-[10px] font-medium ${isOpen ? "text-rose-500" : "text-stone-400"}`}>
                Lainnya
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

// Sub-komponen agar kode lebih bersih
function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: LucideIcon; active: boolean }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-0.5 py-1 group">
      <span className={`
        relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-300
        ${active ? "bg-rose-500 shadow-[0_2px_12px_rgba(244,63,94,0.35)]" : "bg-transparent"}
      `}>
        <Icon
          className={`w-4 h-4 transition-all ${active ? "text-white" : "text-stone-400"}`}
          strokeWidth={active ? 2.5 : 1.8}
        />
      </span>
      <span className={`text-[10px] font-medium ${active ? "text-rose-500" : "text-stone-400"}`}>
        {label}
      </span>
    </Link>
  );
}