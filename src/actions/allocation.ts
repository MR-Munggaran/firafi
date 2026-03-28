"use server";

import { db } from "@/db";
import { allocationTemplates, budgets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "./_helpers";
import { allocationFilter, budgetFilter, ownerFields } from "./_filters";
import { ok, fail, type ActionResult } from "./types";
import type { AllocationRule } from "@/lib/allocation-presets";

export interface AllocationTemplate {
  id:        number;
  name:      string;
  isDefault: number;
  rules:     AllocationRule[];
}

// ─── GET default template ─────────────────────────────────────────────────────

export async function getDefaultTemplate(): Promise<AllocationTemplate | null> {
  const session = await getSession();
  if (!session.ok) return null;

  const row = await db.query.allocationTemplates.findFirst({
    where: and(
      allocationFilter(session.coupleId, session.userId),
      eq(allocationTemplates.isDefault, 1),
    ),
  });

  if (!row) return null;

  return {
    id:        row.id,
    name:      row.name,
    isDefault: row.isDefault,
    rules:     JSON.parse(row.rules) as AllocationRule[],
  };
}

// ─── GET semua template ───────────────────────────────────────────────────────

export async function getAllTemplates(): Promise<AllocationTemplate[]> {
  const session = await getSession();
  if (!session.ok) return [];

  const rows = await db.query.allocationTemplates.findMany({
    where:   allocationFilter(session.coupleId, session.userId),
    orderBy: (t, { desc }) => [desc(t.isDefault), desc(t.createdAt)],
  });

  return rows.map((r) => ({
    id:        r.id,
    name:      r.name,
    isDefault: r.isDefault,
    rules:     JSON.parse(r.rules) as AllocationRule[],
  }));
}

// ─── SAVE / UPDATE template ───────────────────────────────────────────────────

export async function saveTemplate(
  name: string,
  rules: AllocationRule[],
  setAsDefault = true,
): Promise<ActionResult<AllocationTemplate>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  const total = rules.reduce((s, r) => s + r.percent, 0);
  if (Math.round(total) !== 100) {
    return fail(`Total alokasi harus 100% (sekarang ${total}%)`);
  }

  if (setAsDefault) {
    await db.update(allocationTemplates)
      .set({ isDefault: 0 })
      .where(allocationFilter(session.coupleId, session.userId));
  }

  const [saved] = await db.insert(allocationTemplates).values({
    ...ownerFields(session.coupleId, session.userId),
    name,
    isDefault: setAsDefault ? 1 : 0,
    rules:     JSON.stringify(rules),
  }).returning();

  revalidatePath("/settings");
  return ok({
    id:        saved.id,
    name:      saved.name,
    isDefault: saved.isDefault,
    rules:     JSON.parse(saved.rules),
  });
}

// ─── SET DEFAULT template ─────────────────────────────────────────────────────

export async function setDefaultTemplate(templateId: number): Promise<ActionResult<{ id: number }>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  await db.update(allocationTemplates)
    .set({ isDefault: 0 })
    .where(allocationFilter(session.coupleId, session.userId));

  await db.update(allocationTemplates)
    .set({ isDefault: 1 })
    .where(and(
      eq(allocationTemplates.id, templateId),
      allocationFilter(session.coupleId, session.userId),
    ));

  revalidatePath("/settings");
  return ok({ id: templateId });
}

// ─── APPLY ALLOCATION ke budget ───────────────────────────────────────────────

export async function applyAllocation(
  income: number,
  rules:  AllocationRule[],
  month:  number,
  year:   number,
): Promise<ActionResult<{ created: number; skipped: number }>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  let created = 0;
  let skipped = 0;

  for (const rule of rules) {
    if (rule.percent <= 0) continue;
    const amount = Math.round((income * rule.percent) / 100);
    if (amount <= 0) continue;

    const existing = await db.query.budgets.findFirst({
      where: and(
        budgetFilter(session.coupleId, session.userId),
        eq(budgets.category, rule.category),
        eq(budgets.month, month),
        eq(budgets.year, year),
      ),
    });

    if (existing) {
      await db.update(budgets)
        .set({ amount: String(Number(existing.amount) + amount) })
        .where(eq(budgets.id, existing.id));
      skipped++;
    } else {
      await db.insert(budgets).values({
        ...ownerFields(session.coupleId, session.userId),
        category: rule.category,
        amount:   String(amount),
        month,
        year,
      });
      created++;
    }
  }

  revalidatePath("/budget");
  return ok({ created, skipped });
}

// ─── DELETE template ──────────────────────────────────────────────────────────

export async function deleteTemplate(templateId: number): Promise<ActionResult<{ id: number }>> {
  const session = await getSession();
  if (!session.ok) return session.error;

  await db.delete(allocationTemplates).where(
    and(
      eq(allocationTemplates.id, templateId),
      allocationFilter(session.coupleId, session.userId),
    )
  );

  revalidatePath("/settings");
  return ok({ id: templateId });
}