"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { coupleMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fail, type ActionError } from "./types";

// ─── Session types ────────────────────────────────────────────────────────────

export type SessionOk = {
  ok:       true;
  userId:   string;
  coupleId: number | null;
  role:     "owner" | "partner" | "solo";
};

export type SessionErr = {
  ok:    false;
  error: ActionError;
};

export type SessionResult = SessionOk | SessionErr;

// ─── getSession ───────────────────────────────────────────────────────────────

export async function getSession(): Promise<SessionResult> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false, error: fail("Tidak terautentikasi") };
  }

  const member = await db.query.coupleMembers.findFirst({
    where: eq(coupleMembers.userId, user.id),
  });

  return {
    ok:       true,
    userId:   user.id,
    coupleId: member?.coupleId ?? null,
    role:     member?.role ?? "solo",
  };
}