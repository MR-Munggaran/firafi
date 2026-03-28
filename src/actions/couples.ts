"use server";

import { db } from "@/db";
import { couples, coupleMembers, wallets, transactions, budgets, goals, moments, allocationTemplates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "./_helpers";
import { ok, fail, type ActionResult } from "./types";
import type { InferSelectModel } from "drizzle-orm";

export type Couple = InferSelectModel<typeof couples>;
export type CoupleMember = InferSelectModel<typeof coupleMembers> & {
  user: { id: string; name: string; email: string; avatarUrl: string | null };
};

// ─── Migrate data couple → solo (kebalikan dari migrateSoloDataToCouple) ─────

async function migrateDataToSolo(userId: string, coupleId: number) {
  await db.update(wallets)
    .set({ coupleId: null })
    .where(and(eq(wallets.coupleId, coupleId), eq(wallets.ownerId, userId)));

  await db.update(transactions)
    .set({ coupleId: null })
    .where(and(eq(transactions.coupleId, coupleId), eq(transactions.userId, userId)));

  await db.update(budgets)
    .set({ coupleId: null, userId })
    .where(and(eq(budgets.coupleId, coupleId), eq(budgets.userId, userId)));

  await db.update(goals)
    .set({ coupleId: null, userId })
    .where(and(eq(goals.coupleId, coupleId), eq(goals.userId, userId)));

  await db.update(moments)
    .set({ coupleId: null })
    .where(and(eq(moments.coupleId, coupleId), eq(moments.uploaderId, userId)));

  await db.update(allocationTemplates)
    .set({ coupleId: null, userId })
    .where(and(eq(allocationTemplates.coupleId, coupleId), eq(allocationTemplates.userId, userId)));
}

// ─── GET COUPLE INFO ──────────────────────────────────────────────────────────

export async function getCoupleInfo(): Promise<(Couple & { members: CoupleMember[] }) | null> {
  const session = await getSession();
  if (!session.ok || !session.coupleId) return null;

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
  if (!session.coupleId) return fail("Kamu belum bergabung dengan couple");
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
  if (!session.coupleId) return fail("Kamu belum bergabung dengan couple");
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
  if (!session.coupleId) return fail("Kamu belum bergabung dengan couple");
  if (session.role !== "owner") return fail("Hanya owner yang bisa mengubah nama couple");
  if (!name.trim()) return fail("Nama couple tidak boleh kosong");

  const [updated] = await db.update(couples)
    .set({ name: name.trim() })
    .where(eq(couples.id, session.coupleId))
    .returning();

  revalidatePath("/settings");
  return ok(updated);
}

// ─── REMOVE MEMBER (by owner) ─────────────────────────────────────────────────

export async function removeMember(userId: string): Promise<ActionResult<{ userId: string }>> {
  const session = await getSession();
  if (!session.ok) return session.error;
  if (!session.coupleId) return fail("Kamu belum bergabung dengan couple");
  if (session.role !== "owner") return fail("Hanya owner yang bisa mengeluarkan anggota");
  if (userId === session.userId) return fail("Gunakan 'Keluar dari Couple' untuk keluar sendiri");

  // kembalikan data partner ke solo mode sebelum dikeluarkan
  await migrateDataToSolo(userId, session.coupleId);

  await db.delete(coupleMembers).where(
    and(
      eq(coupleMembers.coupleId, session.coupleId),
      eq(coupleMembers.userId, userId),
    )
  );

  revalidatePath("/settings");
  return ok({ userId });
}

// ─── LEAVE COUPLE (partner) ───────────────────────────────────────────────────

export async function leaveCouple(): Promise<ActionResult<{ left: true }>> {
  const session = await getSession();
  if (!session.ok) return session.error;
  if (!session.coupleId) return fail("Kamu belum bergabung dengan couple");

  // partner keluar biasa — data balik ke solo
  if (session.role === "partner") {
    await migrateDataToSolo(session.userId, session.coupleId);

    await db.delete(coupleMembers).where(
      and(
        eq(coupleMembers.coupleId, session.coupleId),
        eq(coupleMembers.userId, session.userId),
      )
    );

    return ok({ left: true });
  }

  // owner keluar — cek apakah couple sudah sendiri
  const members = await db.query.coupleMembers.findMany({
    where: eq(coupleMembers.coupleId, session.coupleId),
  });

  if (members.length > 1) {
    return fail("Kamu adalah owner. Keluarkan anggota lain terlebih dahulu sebelum membubarkan couple.");
  }

  // owner sendirian → bubarkan couple sekalian
  await migrateDataToSolo(session.userId, session.coupleId);

  // hapus couple member dulu, lalu couple-nya (cascade harusnya handle ini, tapi eksplisit lebih aman)
  await db.delete(coupleMembers).where(eq(coupleMembers.coupleId, session.coupleId));
  await db.update(couples)
    .set({ status: "inactive" })
    .where(eq(couples.id, session.coupleId));

  return ok({ left: true });
}