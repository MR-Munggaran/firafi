"use server";

import { db } from "@/db";
import { couples, coupleMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "./_helpers";
import { ok, fail, type ActionResult } from "./types";
import type { InferSelectModel } from "drizzle-orm";

export type Couple = InferSelectModel<typeof couples>;
export type CoupleMember = InferSelectModel<typeof coupleMembers> & {
  user: { id: string; name: string; email: string; avatarUrl: string | null };
};

// ─── GET COUPLE INFO ──────────────────────────────────────────────────────────

export async function getCoupleInfo(): Promise<(Couple & { members: CoupleMember[] }) | null> {
  const session = await getSession();
  if (!session.ok) return null;

  const couple = await db.query.couples.findFirst({
    where: eq(couples.id, session.coupleId),
    with: {
      members: {
        with: {
          user: { columns: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
    },
  });

  return couple as (Couple & { members: CoupleMember[] }) ?? null;
}

// ─── GET INVITE CODE ──────────────────────────────────────────────────────────

export async function getInviteCode(): Promise<ActionResult<{ inviteCode: string }>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  if (session.role !== "owner") return fail("Hanya owner yang bisa melihat kode undangan");

  const couple = await db.query.couples.findFirst({
    where: eq(couples.id, session.coupleId),
  });
  if (!couple) return fail("Couple tidak ditemukan");

  return ok({ inviteCode: couple.inviteCode });
}

// ─── REGENERATE INVITE CODE ───────────────────────────────────────────────────

export async function regenerateInviteCode(): Promise<ActionResult<{ inviteCode: string }>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  if (session.role !== "owner") return fail("Hanya owner yang bisa regenerate kode undangan");

  const result = await db.execute<{ generate_invite_code: string }>(
    `select generate_invite_code() as generate_invite_code`
  );
  const newCode = result.rows[0]?.generate_invite_code;
  if (!newCode) return fail("Gagal generate kode baru");

  const [updated] = await db.update(couples)
    .set({ inviteCode: newCode })
    .where(eq(couples.id, session.coupleId))
    .returning();

  revalidatePath("/settings");
  return ok({ inviteCode: updated.inviteCode });
}

// ─── UPDATE COUPLE NAME ───────────────────────────────────────────────────────

export async function updateCoupleName(name: string): Promise<ActionResult<Couple>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  if (session.role !== "owner") return fail("Hanya owner yang bisa mengubah nama couple");
  if (!name.trim()) return fail("Nama couple tidak boleh kosong");

  const [updated] = await db.update(couples)
    .set({ name: name.trim() })
    .where(eq(couples.id, session.coupleId))
    .returning();

  revalidatePath("/settings");
  return ok(updated);
}

// ─── REMOVE MEMBER ────────────────────────────────────────────────────────────

export async function removeMember(userId: string): Promise<ActionResult<{ userId: string }>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  if (session.role !== "owner") return fail("Hanya owner yang bisa mengeluarkan anggota");
  if (userId === session.userId) return fail("Owner tidak bisa mengeluarkan diri sendiri");

  await db.delete(coupleMembers)
    .where(and(
      eq(coupleMembers.coupleId, session.coupleId),
      eq(coupleMembers.userId, userId),
    ));

  revalidatePath("/settings");
  return ok({ userId });
}

// ─── LEAVE COUPLE ─────────────────────────────────────────────────────────────

export async function leaveCouple(): Promise<ActionResult<{ left: true }>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  if (session.role === "owner") {
    return fail("Owner tidak bisa keluar. Hapus couple atau transfer ownership terlebih dahulu.");
  }

  await db.delete(coupleMembers)
    .where(and(
      eq(coupleMembers.coupleId, session.coupleId),
      eq(coupleMembers.userId, session.userId),
    ));

  return ok({ left: true });
}