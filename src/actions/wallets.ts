"use server";

import { db } from "@/db";
import { wallets } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { walletSchema } from "@/lib/validations";
import { getSession } from "./_helpers";
import { ok, fail, type ActionResult } from "./types";
import type { InferSelectModel } from "drizzle-orm";

export type Wallet = InferSelectModel<typeof wallets>;
export type WalletWithOwner = Wallet & {
  owner: { id: string; name: string; avatarUrl: string | null } | null;
};

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function getWallets(): Promise<WalletWithOwner[]> {
  const session = await getSession();
  if (!session.ok) return [];

  return db.query.wallets.findMany({
    where:   eq(wallets.coupleId, session.coupleId),
    orderBy: asc(wallets.createdAt),
    with:    { owner: { columns: { id: true, name: true, avatarUrl: true } } },
  }) as Promise<WalletWithOwner[]>;
}

export async function getWalletById(id: number): Promise<WalletWithOwner | null> {
  const session = await getSession();
  if (!session.ok) return null;

  const result = await db.query.wallets.findFirst({
    where: and(eq(wallets.id, id), eq(wallets.coupleId, session.coupleId)),
    with:  { owner: { columns: { id: true, name: true, avatarUrl: true } } },
  });

  return (result as WalletWithOwner) ?? null;
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createWallet(input: unknown): Promise<ActionResult<Wallet>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  const parsed = walletSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Validasi gagal", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const { name, type, balance, color, ownerId } = parsed.data;

  const [wallet] = await db.insert(wallets).values({
    coupleId: session.coupleId,
    ownerId:  ownerId ?? session.userId,
    name,
    type,
    balance:  String(balance),
    color:    color ?? "#f43f5e",
  }).returning();

  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  return ok(wallet);
}

// ─── ADJUST BALANCE ───────────────────────────────────────────────────────────

export async function adjustWalletBalance(
  walletId: number,
  delta: number,
): Promise<ActionResult<Wallet>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  const wallet = await db.query.wallets.findFirst({
    where: and(eq(wallets.id, walletId), eq(wallets.coupleId, session.coupleId)),
  });
  if (!wallet) return fail("Dompet tidak ditemukan");

  const [updated] = await db.update(wallets)
    .set({ balance: sql`balance + ${String(delta)}` })
    .where(and(eq(wallets.id, walletId), eq(wallets.coupleId, session.coupleId)))
    .returning();

  return ok(updated);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteWallet(id: number): Promise<ActionResult<{ id: number }>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  if (session.role !== "owner") return fail("Hanya owner yang bisa menghapus dompet");

  await db.delete(wallets)
    .where(and(eq(wallets.id, id), eq(wallets.coupleId, session.coupleId)));

  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  return ok({ id });
}