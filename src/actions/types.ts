import type { ZodError } from "zod";
import type { users, wallets, transactions, budgets, goals, moments } from "@/db/schema";

// ─── Drizzle Inferred Types ───────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type Moment = typeof moments.$inferSelect;

// ─── Relational Types ─────────────────────────────────────────────────────────

export type WalletWithOwner = Wallet & {
  owner: User | null;
};

export type TransactionWithRelations = Transaction & {
  wallet: Wallet;
  user: User;
};

export type MomentWithRelations = Moment & {
  uploader: User;
  transaction: Transaction | null;
};

export type TransactionFilter = {
  limit?: number;
  type?: "income" | "expense";
  month?: number;
  year?: number;
  walletId?: number;
  userId?: number;
};

// ─── Action Response Types ────────────────────────────────────────────────────

export type ActionSuccess<T> = {
  success: true;
  data: T;
};

export type ActionError = {
  success: false;
  error: string;
  fieldErrors?: Record<string, string[]>;
};

export type ActionResult<T> = ActionSuccess<T> | ActionError;

// ─── Response Helpers ─────────────────────────────────────────────────────────

export function ok<T>(data: T): ActionSuccess<T> {
  return { success: true, data };
}

export function fail(error: string, fieldErrors?: Record<string, string[]>): ActionError {
  return { success: false, error, fieldErrors };
}

export function fromZodError(zodError: ZodError): ActionError {
  return {
    success: false,
    error: "Validasi gagal. Periksa kembali isian form.",
    fieldErrors: zodError.flatten().fieldErrors as Record<string, string[]>,
  };
}