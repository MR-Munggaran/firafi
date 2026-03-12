import { z } from "zod";

// ─── User ─────────────────────────────────────────────────────────────────────

export const userSchema = z.object({
  name:      z.string().min(1, "Nama wajib diisi").max(100),
  email:     z.string().email("Email tidak valid"),
  avatarUrl: z.string().url().optional().nullable(),
});

// ─── Wallet ───────────────────────────────────────────────────────────────────
// coupleId diambil dari session, bukan dari input client

export const walletSchema = z.object({
  name:    z.string().min(1, "Nama dompet wajib diisi").max(100),
  type:    z.enum(["cash", "bank", "ewallet", "investment", "other"]).default("cash"),
  balance: z.coerce.number().default(0),
  color:   z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  ownerId: z.string().uuid().optional().nullable(),
});

// ─── Transaction ──────────────────────────────────────────────────────────────
// coupleId & userId diambil dari session

export const transactionSchema = z.object({
  walletId:   z.number().int().positive("Pilih dompet"),
  type:       z.enum(["income", "expense"]),
  amount:     z.coerce.number().positive("Nominal harus lebih dari 0"),
  category:   z.string().min(1, "Kategori wajib diisi"),
  note:       z.string().max(500).optional().nullable(),
  date:       z.coerce.date(),
  receiptUrl: z.string().url().optional().nullable(),
});

// ─── Budget ───────────────────────────────────────────────────────────────────
// coupleId diambil dari session

export const budgetSchema = z.object({
  category: z.string().min(1, "Kategori wajib diisi"),
  amount:   z.coerce.number().positive("Nominal harus lebih dari 0"),
  month:    z.number().int().min(1).max(12),
  year:     z.number().int().min(2020),
});

// ─── Goal ─────────────────────────────────────────────────────────────────────
// coupleId diambil dari session

export const goalSchema = z.object({
  name:         z.string().min(1, "Nama target wajib diisi").max(100),
  targetAmount: z.coerce.number().positive("Target harus lebih dari 0"),
  savedAmount:  z.coerce.number().min(0).default(0),
  targetDate:   z.coerce.date().optional().nullable(),
  emoji:        z.string().max(4).default("🎯"),
  status:       z.enum(["ongoing", "completed", "paused"]).default("ongoing"),
});

// ─── Moment ───────────────────────────────────────────────────────────────────
// coupleId & uploaderId diambil dari session

export const momentSchema = z.object({
  transactionId: z.number().int().positive().optional().nullable(),
  imageUrl:      z.string().url("URL gambar tidak valid"),
  caption:       z.string().max(500).optional().nullable(),
  date:          z.coerce.date().optional(),
});