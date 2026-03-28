import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav }    from "@/components/layout/BottomNav";
import { SideNav }      from "@/components/layout/SideNav";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster }      from "sonner";

export const metadata: Metadata = {
  title: "Firafi — Budget Bersama 💕",
  description: "Kelola keuangan bersama dengan penuh kasih sayang",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#fdf8f6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <ThemeProvider>

          {/* ── DESKTOP (md+): sidebar kiri fixed + konten scrollable ── */}
          <div className="hidden md:flex min-h-screen">
            <SideNav />

            {/*
              Konten utama: margin kiri = lebar sidebar.
              px simetris kiri-kanan + max-w agar tidak melebar di ultrawide.
              mx-auto di dalam agar konten centered di area sisa.
            */}
            <main className="flex-1 ml-60 lg:ml-64 min-h-screen overflow-y-auto">
              <div className="max-w-5xl mx-auto px-8 lg:px-12 py-10">
                {children}
              </div>
            </main>
          </div>

          {/* ── MOBILE (<md): full-width + bottom nav ── */}
          <div className="md:hidden">
            <main
              className="
                w-full px-4 pt-6
                pb-[calc(var(--bottom-nav-h,64px)+env(safe-area-inset-bottom,0px)+20px)]
                min-h-dvh
              "
            >
              {children}
            </main>
            <BottomNav />
          </div>

          <Toaster
            richColors
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                borderRadius: "16px",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}