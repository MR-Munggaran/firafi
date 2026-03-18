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
  { href: "/dashboard",    label: "Home",     icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight  },
  { href: "/budget",       label: "Budget",   icon: PiggyBank       },
  { href: "/goals",        label: "Goals",    icon: Target          },
] as const;

const MORE_NAV = [
  { href: "/wallets",  label: "Dompet"   },
  { href: "/moments",  label: "Momen"    },
  { href: "/settings", label: "Settings" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // Cek apakah salah satu MORE_NAV sedang aktif
  const moreActive = MORE_NAV.some(({ href }) => isActive(href));

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav
        aria-label="Navigasi utama"
        style={{ height: "var(--bottom-nav-h)", borderColor: "var(--border)" }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t safe-bottom"
      >
        {/* garis gradient tipis di atas */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-60"
          style={{
            background:
              "linear-gradient(to right, transparent, var(--accent-400), transparent)",
          }}
        />

        {/* Dropup Menu — tanpa icon, teks saja */}
        <div
          className={`
            absolute bottom-full right-4 mb-2 min-w-[130px]
            bg-white rounded-2xl shadow-xl overflow-hidden
            transition-all duration-300 origin-bottom-right
            ${isOpen
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-90 opacity-0 translate-y-4 pointer-events-none"}
          `}
          style={{ border: "1px solid var(--border)" }}
        >
          <div className="p-2 flex flex-col gap-0.5">
            {MORE_NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
                style={
                  isActive(href)
                    ? { background: "var(--accent-50)", color: "var(--accent-500)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Tab bar utama */}
        <ul className="flex h-full items-center justify-around px-2">
          {MAIN_NAV.map(({ href, label, icon: Icon }) => (
            <li key={href} className="flex-1">
              <NavItem
                href={href}
                label={label}
                icon={Icon}
                active={isActive(href)}
              />
            </li>
          ))}

          {/* Tombol Lainnya */}
          <li className="flex-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex flex-col items-center justify-center gap-0.5 py-1 w-full"
            >
              {/* Icon MoreHorizontal hanya muncul saat salah satu MORE_NAV aktif atau dropdown terbuka */}
              {(isOpen || moreActive) ? (
                <span
                  className="relative flex items-center justify-center w-10 h-7 rounded-full"
                  style={{ background: "var(--accent-500)", boxShadow: "var(--shadow-accent)" }}
                >
                  <MoreHorizontal className="w-4 h-4 text-white" />
                </span>
              ) : (
                <span className="h-7 flex items-center">
                  {/* spacer agar tinggi konsisten */}
                </span>
              )}
              <span
                className="text-[10px] font-medium"
                style={{ color: isOpen || moreActive ? "var(--accent-500)" : "var(--text-muted)" }}
              >
                Lainnya
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-0.5 py-1 group"
    >
      {/* Icon hanya tampil saat aktif */}
      {active ? (
        <span
          className="relative flex items-center justify-center w-10 h-7 rounded-full"
          style={{
            background: "var(--accent-500)",
            boxShadow: "var(--shadow-accent)",
          }}
        >
          <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
        </span>
      ) : (
        /* spacer supaya tinggi tab tetap konsisten */
        <span className="h-7 flex items-center" />
      )}

      <span
        className="text-[10px] font-medium transition-colors"
        style={{ color: active ? "var(--accent-500)" : "var(--text-muted)" }}
      >
        {label}
      </span>
    </Link>
  );
}