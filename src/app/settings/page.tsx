import { getCurrentUser } from "@/actions/users";
import { getCoupleInfo, getInviteCode } from "@/actions/couples";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { CoupleSection } from "@/components/settings/CoupleSection";
import { InviteCodeSection } from "@/components/settings/InviteCodeSection";
import { DangerZone } from "@/components/settings/DangerZone";
import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { ThemeSwitcher } from "@/components/ui/themeSwitcher";

export default async function SettingsPage() {
  const [userRes, coupleRes, inviteRes] = await Promise.allSettled([
    getCurrentUser(),
    getCoupleInfo(),
    getInviteCode(),
  ]);

  const user       = userRes.status   === "fulfilled" ? userRes.value   : null;
  const couple     = coupleRes.status === "fulfilled" ? coupleRes.value : null;
  const members    = couple?.members ?? [];
  const inviteRes2 = inviteRes.status === "fulfilled" ? inviteRes.value : null;
  const inviteCode = inviteRes2?.success ? inviteRes2.data.inviteCode : null;

  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Profil & couple kalian" emoji="⚙️" />

      <div className="space-y-4 pb-24">
        <ProfileSection user={user} />
        <CoupleSection couple={couple} members={members} />
        <InviteCodeSection inviteCode={inviteCode} />

        {/* Tombol ke Onboarding */}
        <div className="px-1">
          <Link
            href="/onboarding"
            className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-100 shadow-sm active:scale-[0.98] transition-all group"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform"
                style={{ background: "var(--accent-50)", color: "var(--accent-500)" }}
              >
                <Sparkles className="w-5 h-5" style={{ fill: "var(--accent-500)" }} />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-800 leading-none mb-1">Panduan Setup</p>
                <p className="text-[11px] text-stone-400 font-medium tracking-tight">Kembali ke halaman onboarding</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Theme Switcher */}
        <div
          className="bg-white rounded-2xl p-4 mx-1"
          style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--border)" }}
        >
          <ThemeSwitcher />
        </div>

        <DangerZone />
      </div>
    </>
  );
}
