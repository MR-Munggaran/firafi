"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { coupleMembers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fail, type ActionError } from "./types";

// ─── Discriminated union — TypeScript bisa narrow dengan session.ok ──────────

export type SessionOk = {
  ok:       true;
  userId:   string;
  coupleId: number;
  role:     "owner" | "partner";
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

  if (!member) {
    return { ok: false, error: fail("Kamu belum bergabung dengan couple manapun") };
  }

  return {
    ok:       true,
    userId:   user.id,
    coupleId: member.coupleId,
    role:     member.role,
  };
}