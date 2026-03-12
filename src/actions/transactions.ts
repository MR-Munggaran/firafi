"use server";

import { db } from "@/db";
import { transactions, wallets } from "@/db/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { transactionSchema } from "@/lib/validations";
import { getSession } from "./_helpers";
import { ok, fail, type ActionResult } from "./types";
import type { InferSelectModel } from "drizzle-orm";

export type Transaction = InferSelectModel<typeof transactions>;
export type TransactionWithRelations = Transaction & {
  wallet: { id: number; name: string; color: string | null };
  user:   { id: string; name: string; avatarUrl: string | null };
};

export interface TransactionFilter {
  month?:    number;
  year?:     number;
  type?:     "income" | "expense";
  walletId?: number;
  limit?:    number;
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function getTransactions(
  filter: TransactionFilter = {}
): Promise<TransactionWithRelations[]> {
  const session = await getSession();
  if (!session.ok) return [];

  const { month, year, type, walletId, limit = 100 } = filter;

  const conditions = [eq(transactions.coupleId, session.coupleId)];
  if (type)     conditions.push(eq(transactions.type, type));
  if (walletId) conditions.push(eq(transactions.walletId, walletId));
  if (month && year) {
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0, 23, 59, 59);
    conditions.push(gte(transactions.date, start));
    conditions.push(lte(transactions.date, end));
  }

  return db.query.transactions.findMany({
    where:   and(...conditions),
    orderBy: desc(transactions.date),
    limit,
    with: {
      wallet: { columns: { id: true, name: true, color: true } },
      user:   { columns: { id: true, name: true, avatarUrl: true } },
    },
  }) as Promise<TransactionWithRelations[]>;
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createTransaction(input: unknown): Promise<ActionResult<Transaction>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Validasi gagal", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const { walletId, type, amount, category, note, date, receiptUrl } = parsed.data;

  const wallet = await db.query.wallets.findFirst({
    where: and(eq(wallets.id, walletId), eq(wallets.coupleId, session.coupleId)),
  });
  if (!wallet) return fail("Dompet tidak ditemukan");

  const [tx] = await db.insert(transactions).values({
    coupleId:   session.coupleId,
    walletId,
    userId:     session.userId,
    type,
    amount:     String(amount),
    category,
    note:       note ?? null,
    date,
    receiptUrl: receiptUrl ?? null,
  }).returning();

  const delta = type === "income" ? amount : -amount;
  await db.update(wallets)
    .set({ balance: sql`balance + ${String(delta)}` })
    .where(eq(wallets.id, walletId));

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  return ok(tx);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteTransaction(id: number): Promise<ActionResult<{ id: number }>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  const tx = await db.query.transactions.findFirst({
    where: and(eq(transactions.id, id), eq(transactions.coupleId, session.coupleId)),
  });
  if (!tx) return fail("Transaksi tidak ditemukan");

  if (tx.userId !== session.userId && session.role !== "owner") {
    return fail("Kamu tidak punya akses untuk menghapus transaksi ini");
  }

  const delta = tx.type === "income" ? -Number(tx.amount) : Number(tx.amount);
  await db.update(wallets)
    .set({ balance: sql`balance + ${String(delta)}` })
    .where(eq(wallets.id, tx.walletId));

  await db.delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.coupleId, session.coupleId)));

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  return ok({ id });
}