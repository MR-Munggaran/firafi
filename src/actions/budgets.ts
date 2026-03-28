"use server";

import { db } from "@/db";
import { budgets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { budgetSchema } from "@/lib/validations";
import { getSession } from "./_helpers";
import { budgetFilter, ownerFields } from "./_filters";
import { ok, fail, type ActionResult } from "./types";
import type { InferSelectModel } from "drizzle-orm";

export type Budget = InferSelectModel<typeof budgets>;

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function getBudgets(month: number, year: number): Promise<Budget[]> {
  const session = await getSession();
  if (!session.ok) return [];

  return db.query.budgets.findMany({
    where: and(
      budgetFilter(session.coupleId, session.userId),
      eq(budgets.month, month),
      eq(budgets.year, year),
    ),
  });
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createBudget(input: unknown): Promise<ActionResult<Budget>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Validasi gagal", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const { category, amount, month, year } = parsed.data;

  const existing = await db.query.budgets.findFirst({
    where: and(
      budgetFilter(session.coupleId, session.userId),
      eq(budgets.category, category),
      eq(budgets.month, month),
      eq(budgets.year, year),
    ),
  });
  if (existing) return fail(`Budget untuk ${category} bulan ini sudah ada`);

  const [budget] = await db.insert(budgets).values({
    ...ownerFields(session.coupleId, session.userId),
    category,
    amount: String(amount),
    month,
    year,
  }).returning();

  revalidatePath("/budget");
  return ok(budget);
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateBudget(id: number, amount: number): Promise<ActionResult<Budget>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  if (amount <= 0) return fail("Nominal harus lebih dari 0");

  const [updated] = await db.update(budgets)
    .set({ amount: String(amount) })
    .where(and(eq(budgets.id, id), budgetFilter(session.coupleId, session.userId)))
    .returning();

  if (!updated) return fail("Budget tidak ditemukan");

  revalidatePath("/budget");
  return ok(updated);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteBudget(id: number): Promise<ActionResult<{ id: number }>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  await db.delete(budgets).where(
    and(eq(budgets.id, id), budgetFilter(session.coupleId, session.userId))
  );

  revalidatePath("/budget");
  return ok({ id });
}