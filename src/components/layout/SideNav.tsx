"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  Target,
  Wallet,
  Settings,
  LucideIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",    label: "Home",      icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi",  icon: ArrowLeftRight  },
  { href: "/budget",       label: "Budget",    icon: PiggyBank       },
  { href: "/goals",        label: "Goals",     icon: Target          },
  { href: "/wallets",      label: "Dompet",    icon: Wallet          },
] as const;

const BOTTOM_NAV = [
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function SideNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className="
        fixed top-0 left-0 h-screen w-60 lg:w-64
        flex flex-col
        border-r z-50
      "
      style={{
        background: "var(--bg-surface, white)",
        borderColor: "var(--border)",
      }}
    >
      {/* Branding */}
      <div className="px-5 py-7 flex-shrink-0">
        <p
          className="text-[10px] font-semibold tracking-widest uppercase mb-1"
          style={{ color: "var(--accent-400)" }}
        >
          💕 Firafi
        </p>
        <p className="font-display text-lg font-semibold text-stone-800 leading-tight">
          Budget Bersama
        </p>
      </div>

      <div className="mx-4 h-px mb-2" style={{ background: "var(--border)" }} />

      {/* Main nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <NavLink key={href} href={href} label={label} icon={Icon} active={active} />
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6 flex-shrink-0">
        <div className="mx-1 h-px mb-2" style={{ background: "var(--border)" }} />
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <NavLink key={href} href={href} label={label} icon={Icon} active={active} />
          );
        })}
      </div>
    </aside>
  );
}

function NavLink({
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
      className="
        flex items-center gap-3 px-3 py-2.5 rounded-xl
        text-sm font-medium transition-all duration-150
        hover:bg-stone-50
      "
      style={
        active
          ? { background: "var(--accent-50)", color: "var(--accent-600)" }
          : { color: "var(--text-secondary, #78716c)" }
      }
    >
      <span
        className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all"
        style={
          active
            ? { background: "var(--accent-500)", boxShadow: "var(--shadow-accent)" }
            : {}
        }
      >
        <Icon
          className="w-4 h-4"
          strokeWidth={active ? 2.5 : 2}
          style={{ color: active ? "white" : "inherit" }}
        />
      </span>
      {label}
    </Link>
  );
}