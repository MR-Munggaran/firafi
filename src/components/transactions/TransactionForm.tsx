"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTransaction } from "@/actions/transactions";
import { toast } from "sonner";
import { Upload, X, ChevronDown, Check, Wallet as WalletIcon, Calendar } from "lucide-react";
import { AllocationModal } from "@/components/AllocationModal";
import type { WalletWithOwner } from "@/actions/wallets";
import type { User } from "@/actions/users";
import type { AllocationTemplate } from "@/actions/allocation";

const EXPENSE_CATEGORIES = [
  "🍔 Makanan & Minuman", "🛒 Belanja", "🚗 Transportasi",
  "🏠 Rumah & Tagihan", "💊 Kesehatan", "👗 Fashion",
  "🎮 Hiburan", "📚 Pendidikan", "✈️ Liburan",
  "💆 Perawatan Diri", "🎁 Hadiah", "💸 Lainnya",
];

const INCOME_CATEGORIES = [
  "💼 Gaji", "💰 Bonus", "📈 Investasi",
  "🏪 Usaha", "🎁 Hadiah", "💵 Lainnya",
];

interface Props {
  wallets: WalletWithOwner[];
  members: User[];
  defaultTemplate: AllocationTemplate | null;
}

export function TransactionForm({ wallets, members, defaultTemplate }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // States untuk Custom Dropdown
  const [category, setCategory] = useState("");
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [walletId, setWalletId] = useState("");
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  const [allocationData, setAllocationData] = useState<{
    income: number; month: number; year: number; template: AllocationTemplate | null;
  } | null>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setIsCatOpen(false);
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) setIsWalletOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!category || !walletId) return toast.error("Pilih kategori dan dompet dulu ya!");
    
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    let receiptUrl: string | null = null;

    if (receiptFile) {
      const uploadForm = new FormData();
      uploadForm.append("file", receiptFile);
      uploadForm.append("folder", "receipts");
      const res = await fetch("/api/upload", { method: "POST", body: uploadForm });
      const data = await res.json() as { url?: string };
      if (data.url) receiptUrl = data.url;
    }

    const dateRaw = fd.get("date") as string;
    const amount = Number(fd.get("amount"));
    const txDate = dateRaw ? new Date(dateRaw) : new Date();

    const result = await createTransaction({
      walletId: Number(walletId),
      type,
      category,
      amount,
      note: (fd.get("note") as string) || null,
      receiptUrl,
      date: txDate,
    });

    setLoading(false);
    if (!result.success) return toast.error(result.error);

    toast.success("Transaksi dicatat! 🎉");
    if (type === "income") {
      setAllocationData({
        income: amount, month: txDate.getMonth() + 1, year: txDate.getFullYear(), template: defaultTemplate,
      });
      return;
    }
    router.push("/transactions");
    router.refresh();
  }

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const selectedWallet = wallets.find(w => w.id.toString() === walletId);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 pb-24">
        {/* Toggle Tipe */}
        <div className="flex bg-stone-100 p-1.5 rounded-2xl shadow-inner">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setCategory(""); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                type === t
                  ? t === "expense" ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {t === "expense" ? "💸 Keluar" : "💰 Masuk"}
            </button>
          ))}
        </div>

        {/* Jumlah */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 p-5 group focus-within:ring-2 focus-within:ring-rose-100 transition-all">
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-2 ml-1">Jumlah</label>
          <div className="flex items-center gap-3">
            <span className="text-stone-300 font-bold text-2xl">Rp</span>
            <input
              name="amount"
              type="number"
              required
              placeholder="0"
              className="flex-1 font-display text-3xl font-bold text-stone-800 bg-transparent outline-none placeholder-stone-100"
            />
          </div>
        </div>

        {/* Custom Category Dropdown */}
        <div className="relative" ref={catRef}>
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 transition-all focus-within:border-rose-200">
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Kategori</label>
            <button
              type="button"
              onClick={() => setIsCatOpen(!isCatOpen)}
              className="w-full flex items-center justify-between text-sm font-semibold text-stone-700"
            >
              <span className={category ? "text-stone-800" : "text-stone-300"}>
                {category || "Pilih kategori..."}
              </span>
              <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {isCatOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 grid grid-cols-1 max-h-60 overflow-y-auto animate-in zoom-in-95 duration-200">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setCategory(c); setIsCatOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
                    category === c ? "bg-rose-50 text-rose-600" : "hover:bg-stone-50 text-stone-600"
                  }`}
                >
                  <span className="font-medium">{c}</span>
                  {category === c && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dompet & Tanggal */}
        <div className="grid grid-cols-2 gap-3">
          {/* Custom Wallet Dropdown */}
          <div className="relative" ref={walletRef}>
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 h-full">
              <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Dompet</label>
              <button
                type="button"
                onClick={() => setIsWalletOpen(!isWalletOpen)}
                className="w-full flex items-center justify-between text-sm font-semibold text-stone-700"
              >
                <div className="flex items-center gap-2 truncate">
                  <WalletIcon className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className={walletId ? "text-stone-800 truncate" : "text-stone-300"}>
                    {selectedWallet?.name || "Pilih..."}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-stone-400 ml-1" />
              </button>
            </div>
            
            {isWalletOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 animate-in zoom-in-95 duration-200">
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => { setWalletId(w.id.toString()); setIsWalletOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors ${
                      walletId === w.id.toString() ? "bg-rose-50 text-rose-600 font-bold" : "hover:bg-stone-50 text-stone-600"
                    }`}
                  >
                    <span className="truncate">{w.name}</span>
                    {walletId === w.id.toString() && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
            <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1.5 ml-1">Tanggal</label>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <input
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full bg-transparent text-sm font-semibold text-stone-700 focus:outline-none appearance-none"
              />
            </div>
          </div>
        </div>

        {/* Catatan */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-1 ml-1">Catatan</label>
          <input
            name="note"
            placeholder="Ada cerita apa di transaksi ini?"
            className="w-full bg-transparent text-sm text-stone-700 outline-none placeholder-stone-200"
          />
        </div>

        {/* Upload Struk */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-3 ml-1">Bukti Struk</label>
          {preview ? (
            <div className="relative group">
              <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => { setReceiptFile(null); setPreview(null); }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center py-6 rounded-xl border-2 border-dashed border-stone-100 cursor-pointer hover:bg-stone-50 transition-all group">
              <div className="p-3 bg-stone-50 rounded-full group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5 text-stone-400" />
              </div>
              <span className="text-[10px] font-bold text-stone-400 mt-2 uppercase tracking-widest">Upload Foto</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          )}
        </div>

        {/* Hint Income */}
        {type === "income" && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm">✨</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
              Pendapatan akan masuk ke alokasi budget otomatis setelah kamu simpan.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4.5 rounded-[1.5rem] text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98] ${
            type === 'expense' ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'
          }`}
        >
          {loading ? "Menyimpan..." : "Simpan Transaksi ✨"}
        </button>
      </form>

      {allocationData && (
        <AllocationModal
          income={allocationData.income}
          month={allocationData.month}
          year={allocationData.year}
          defaultTemplate={allocationData.template}
          onClose={() => {
            setAllocationData(null);
            router.push("/transactions");
            router.refresh();
          }}
        />
      )}
    </>
  );
}