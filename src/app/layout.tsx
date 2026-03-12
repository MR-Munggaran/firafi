import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { Toaster } from "sonner";

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
        {/* konten halaman */}
        <main className="max-w-md mx-auto px-4 pt-6 min-h-dvh">
          {children}
        </main>

        {/* navigasi bawah */}
        <BottomNav />

        {/* toast notifications */}
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
      </body>
    </html>
  );
}