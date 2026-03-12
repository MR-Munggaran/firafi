// ─── Tanggal & Bulan ─────────────────────────────────────────────────────────

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatMonth(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day:   "numeric",
    month: "long",
    year:  "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

// ─── Mata Uang ───────────────────────────────────────────────────────────────

export function formatCurrency(
  amount: number | string,
  compact = false
): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rp 0";

  if (compact && Math.abs(num) >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(1)}jt`;
  }
  if (compact && Math.abs(num) >= 1_000) {
    return `Rp ${(num / 1_000).toFixed(0)}rb`;
  }

  return new Intl.NumberFormat("id-ID", {
    style:    "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// ─── Persentase ───────────────────────────────────────────────────────────────

export function calcPercent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}