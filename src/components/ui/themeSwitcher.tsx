"use client";

import { useTheme, type Theme } from "@/components/providers/ThemeProvider";

const THEMES: { value: Theme; label: string; color: string; ring: string }[] = [
  { value: "rose",    label: "Rose",    color: "#f43f5e", ring: "ring-rose-400"    },
  { value: "amber",   label: "Kuning",  color: "#f59e0b", ring: "ring-amber-400"   },
  { value: "emerald", label: "Hijau",   color: "#10b981", ring: "ring-emerald-400" },
  { value: "orange",  label: "Orange",  color: "#f97316", ring: "ring-orange-400"  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        Warna Tema
      </p>
      <div className="flex gap-3">
        {THEMES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            title={t.label}
            className={`
              flex flex-col items-center gap-1.5 group
            `}
          >
            <span
              className={`
                w-9 h-9 rounded-full transition-all duration-200
                ring-2 ring-offset-2
                ${theme === t.value ? t.ring + " scale-110" : "ring-transparent scale-100"}
              `}
              style={{ backgroundColor: t.color }}
            />
            <span
              className="text-[10px] font-medium transition-colors"
              style={{ color: theme === t.value ? "var(--accent-500)" : "var(--text-muted)" }}
            >
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}