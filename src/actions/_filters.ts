// File ini TIDAK pakai "use server" — hanya pure functions untuk Drizzle filters
// Diimport oleh action files bersama getSession dari _helpers.ts

import {
  wallets, transactions, budgets,
  goals, moments, allocationTemplates,
} from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

// ─── Owner filters ────────────────────────────────────────────────────────────
// couple mode → filter by coupleId
// solo mode   → filter by userId + coupleId IS NULL

export function walletFilter(coupleId: number | null, userId: string) {
  return coupleId
    ? eq(wallets.coupleId, coupleId)
    : and(isNull(wallets.coupleId), eq(wallets.ownerId, userId));
}

export function txFilter(coupleId: number | null, userId: string) {
  return coupleId
    ? eq(transactions.coupleId, coupleId)
    : and(isNull(transactions.coupleId), eq(transactions.userId, userId));
}

export function budgetFilter(coupleId: number | null, userId: string) {
  return coupleId
    ? eq(budgets.coupleId, coupleId)
    : and(isNull(budgets.coupleId), eq(budgets.userId, userId));
}

export function goalFilter(coupleId: number | null, userId: string) {
  return coupleId
    ? eq(goals.coupleId, coupleId)
    : and(isNull(goals.coupleId), eq(goals.userId, userId));
}

export function momentFilter(coupleId: number | null, userId: string) {
  return coupleId
    ? eq(moments.coupleId, coupleId)
    : and(isNull(moments.coupleId), eq(moments.uploaderId, userId));
}

export function allocationFilter(coupleId: number | null, userId: string) {
  return coupleId
    ? eq(allocationTemplates.coupleId, coupleId)
    : and(isNull(allocationTemplates.coupleId), eq(allocationTemplates.userId, userId));
}

// ─── INSERT helper ────────────────────────────────────────────────────────────
// Menghindari type error Drizzle saat coupleId null — hanya include field yang relevan

export function ownerFields(coupleId: number | null, userId: string) {
  return coupleId
    ? { coupleId }
    : { userId };
}