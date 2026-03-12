"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "./_helpers";
import { ok, fail, type ActionResult } from "./types";
import type { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // findFirst returns undefined jika tidak ada — konversi ke null
  return (await db.query.users.findFirst({
    where: eq(users.id, user.id),
  })) ?? null;
}

// ─── GET COUPLE MEMBERS ───────────────────────────────────────────────────────

export async function getCoupleMembers(): Promise<User[]> {
  const session = await getSession();
  if (!session.ok) return [];

  const result = await db.query.coupleMembers.findMany({
    where: (cm, { eq }) => eq(cm.coupleId, session.coupleId),
    with:  { user: true },
  });

  return result.map((m) => m.user);
}

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────

export async function updateProfile(input: {
  name?: string;
  avatarUrl?: string;
}): Promise<ActionResult<User>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  const updates: Partial<typeof users.$inferInsert> = {};
  if (input.name?.trim()) updates.name      = input.name.trim();
  if (input.avatarUrl)    updates.avatarUrl = input.avatarUrl;

  if (Object.keys(updates).length === 0) return fail("Tidak ada yang diubah");

  const [updated] = await db.update(users)
    .set(updates)
    .where(eq(users.id, session.userId))
    .returning();

  revalidatePath("/settings");
  return ok(updated);
}