"use server";

import { db } from "@/db";
import { moments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { momentSchema } from "@/lib/validations";
import { getSession } from "./_helpers";
import { ok, fail, type ActionResult } from "./types";
import type { InferSelectModel } from "drizzle-orm";

export type Moment = InferSelectModel<typeof moments>;
export type MomentWithRelations = Moment & {
  uploader:    { id: string; name: string; avatarUrl: string | null };
  transaction: { id: number; category: string; amount: string } | null;
};

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function getMoments(limit = 50): Promise<MomentWithRelations[]> {
  const session = await getSession();
  if (!session.ok) return [];

  return db.query.moments.findMany({
    where:   eq(moments.coupleId, session.coupleId),
    orderBy: desc(moments.createdAt),
    limit,
    with: {
      uploader:    { columns: { id: true, name: true, avatarUrl: true } },
      transaction: { columns: { id: true, category: true, amount: true } },
    },
  }) as Promise<MomentWithRelations[]>;
}

// ─── CREATE ───────────────────────────────────────────────────────────────────

export async function createMoment(input: unknown): Promise<ActionResult<Moment>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  const parsed = momentSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Validasi gagal", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }

  const { imageUrl, caption, transactionId } = parsed.data;

  const [moment] = await db.insert(moments).values({
    coupleId:      session.coupleId,
    uploaderId:    session.userId,
    imageUrl,
    caption:       caption ?? null,
    transactionId: transactionId ?? null,
  }).returning();

  revalidatePath("/moments");
  return ok(moment);
}

// ─── DELETE ───────────────────────────────────────────────────────────────────

export async function deleteMoment(id: number): Promise<ActionResult<{ id: number }>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  const moment = await db.query.moments.findFirst({
    where: and(eq(moments.id, id), eq(moments.coupleId, session.coupleId)),
  });
  if (!moment) return fail("Momen tidak ditemukan");

  if (moment.uploaderId !== session.userId && session.role !== "owner") {
    return fail("Kamu tidak punya akses untuk menghapus momen ini");
  }

  await db.delete(moments)
    .where(and(eq(moments.id, id), eq(moments.coupleId, session.coupleId)));

  revalidatePath("/moments");
  return ok({ id });
}