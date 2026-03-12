import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** konten kanan — biasanya tombol aksi */
  action?: ReactNode;
  /** ornamen emoji/icon kecil di atas judul */
  emoji?: string;
}

export function PageHeader({ title, subtitle, action, emoji }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between mb-6">
      <div>
        {emoji && (
          <span className="text-xl mb-0.5 block leading-none">{emoji}</span>
        )}
        <h1 className="font-display text-3xl font-semibold text-stone-800 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-stone-400 mt-0.5 font-light">{subtitle}</p>
        )}
      </div>

      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </header>
  );
}