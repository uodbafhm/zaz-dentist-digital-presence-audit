import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Logo, Noise } from "@/components/bits";
import Navbar from "@/components/navbar";
import "./globals.css";

const display = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["500", "700", "800", "900"],
  variable: "--font-cairo",
});

const body = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: "MAPSO.RADAR — شنو ناقص عيادة الأسنان رقمياً؟",
  description:
    "منظومة كتحلل الحضور الرقمي ديال عيادات الأسنان: إنستغرام، فيديو العيادة، خرائط جوجل، الموقع والحجز، التقييمات — وكتخرج لائحة النواقص مع خطة عمل.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen">
        <Noise />

        <Navbar />

        <main>{children}</main>

        <footer className="print-hidden border-t-2 border-ink bg-pine text-bone">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
            <Logo dark />
            <p className="text-center text-xs text-bone/60">
              MAPSO.RADAR — رادار الحضور الرقمي لعيادات الأسنان · من الإنستغرام
              حتى الكورسي
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
