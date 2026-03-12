"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { couples, coupleMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

// ─── Login dengan Email ───────────────────────────────────────────────────────

export async function loginWithEmail(formData: FormData) {
  const supabase = await createClient();
  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };
  redirect("/dashboard");
}

// ─── Register dengan Email ────────────────────────────────────────────────────

export async function registerWithEmail(formData: FormData) {
  const supabase = await createClient();
  const name     = formData.get("name") as string;
  const email    = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name }, // dipakai trigger handle_new_user
    },
  });

  if (error) return { error: error.message };

  // redirect ke onboarding — belum punya couple
  redirect("/onboarding");
}

// ─── Login / Register dengan Google ──────────────────────────────────────────

export async function loginWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) return { error: error.message };
  if (data.url) redirect(data.url);
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ─── Onboarding: Buat Couple Baru ────────────────────────────────────────────

export async function createCouple(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const name = formData.get("coupleName") as string;
  if (!name?.trim()) return { error: "Nama pasangan wajib diisi" };

  // generate invite code unik via PostgreSQL function
  const codeResult = await db.execute<{ generate_invite_code: string }>(
    `select generate_invite_code() as generate_invite_code`
  );
  const inviteCode = codeResult.rows?.[0]?.generate_invite_code;
  if (!inviteCode) return { error: "Gagal generate kode undangan" };

  // buat couple
  const [couple] = await db.insert(couples).values({
    name: name.trim(),
    inviteCode,
  }).returning();

  // buat anggota dengan role owner
  await db.insert(coupleMembers).values({
    coupleId: couple.id,
    userId:   user.id,
    role:     "owner",
  });

  redirect("/dashboard");
}

// ─── Onboarding: Gabung via Kode Undangan ────────────────────────────────────

export async function joinCouple(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const code = (formData.get("inviteCode") as string)?.trim().toUpperCase();
  if (!code || code.length !== 6) return { error: "Kode undangan harus 6 karakter" };

  // cari couple dengan kode ini
  const couple = await db.query.couples.findFirst({
    where: eq(couples.inviteCode, code),
    with: { members: true },
  });

  if (!couple) return { error: "Kode undangan tidak ditemukan" };
  if (couple.status !== "active") return { error: "Couple ini sudah tidak aktif" };

  // maksimal 2 anggota per couple
  if (couple.members.length >= 2) {
    return { error: "Couple ini sudah penuh (maks. 2 anggota)" };
  }

  // cek apakah user sudah jadi member
  const alreadyMember = couple.members.some((m) => m.userId === user.id);
  if (alreadyMember) return { error: "Kamu sudah bergabung dengan couple ini" };

  // tambah sebagai partner
  await db.insert(coupleMembers).values({
    coupleId: couple.id,
    userId:   user.id,
    role:     "partner",
  });

  redirect("/dashboard");
}