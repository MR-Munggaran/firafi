"use server";

import { db } from "@/db";
import { goals } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { goalSchema } from "@/lib/validations";
import { getSession } from "./_helpers";
import { ok, fail, type ActionResult } from "./types";
import type { InferSelectModel } from "drizzle-orm";

export type Goal = InferSelectModel<typeof goals>;

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function getGoals(): Promise<Goal[]> {
  const session = await getSession();
  if (!session.ok) return [];

  return db.query.goals.findMany({
    where:   eq(goals.coupleId, session.coupleId),
    orderBy: asc(goals.createdAt),
  });
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createGoal(input: unknown): Promise<ActionResult<Goal>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  const parsed = goalSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Validasi gagal", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const { name, targetAmount, savedAmount, targetDate, emoji } = parsed.data;

  const [goal] = await db.insert(goals).values({
    coupleId:     session.coupleId,
    name,
    targetAmount: String(targetAmount),
    savedAmount:  String(savedAmount ?? 0),
    targetDate:   targetDate ?? null,
    emoji:        emoji ?? "🎯",
    status:       "ongoing",
  }).returning();

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return ok(goal);
}

// ─── ADD TO GOAL ──────────────────────────────────────────────────────────────

export async function addToGoal(
  id: number,
  amount: number,
): Promise<ActionResult<Goal>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  if (amount <= 0) return fail("Nominal harus lebih dari 0");

  const goal = await db.query.goals.findFirst({
    where: and(eq(goals.id, id), eq(goals.coupleId, session.coupleId)),
  });
  if (!goal) return fail("Target tidak ditemukan");

  const newSaved  = Number(goal.savedAmount) + amount;
  const newStatus = newSaved >= Number(goal.targetAmount) ? "completed" : "ongoing";

  const [updated] = await db.update(goals)
    .set({ savedAmount: String(newSaved), status: newStatus })
    .where(and(eq(goals.id, id), eq(goals.coupleId, session.coupleId)))
    .returning();

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return ok(updated);
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export async function updateGoal(
  id: number,
  input: unknown,
): Promise<ActionResult<Goal>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  const parsed = goalSchema.partial().safeParse(input);
  if (!parsed.success) {
    return fail("Validasi gagal", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const updates: Partial<typeof goals.$inferInsert> = {};
  if (parsed.data.name)         updates.name         = parsed.data.name;
  if (parsed.data.targetAmount) updates.targetAmount = String(parsed.data.targetAmount);
  if (parsed.data.targetDate)   updates.targetDate   = parsed.data.targetDate;
  if (parsed.data.emoji)        updates.emoji        = parsed.data.emoji;
  if (parsed.data.status)       updates.status       = parsed.data.status;

  const [updated] = await db.update(goals)
    .set(updates)
    .where(and(eq(goals.id, id), eq(goals.coupleId, session.coupleId)))
    .returning();

  if (!updated) return fail("Target tidak ditemukan");

  revalidatePath("/goals");
  return ok(updated);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteGoal(id: number): Promise<ActionResult<{ id: number }>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  await db.delete(goals)
    .where(and(eq(goals.id, id), eq(goals.coupleId, session.coupleId)));

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  return ok({ id });
}