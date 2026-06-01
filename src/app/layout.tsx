import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Providers } from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMaintenanceMode } from "@/lib/settings-server";
import MaintenancePage from "@/components/MaintenancePage";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VocabMaster - İngilizce Kelime Öğrenme Platformu",
  description: "AI destekli akıllı tekrar sistemi ile İngilizce kelimeleri kalıcı olarak öğrenin. Flashcard, quiz ve oyunlaştırılmış öğrenme deneyimi.",
  keywords: ["ingilizce", "kelime", "öğrenme", "flashcard", "quiz", "vocabulary", "learning"],
  authors: [{ name: "VocabMaster" }],
  creator: "VocabMaster",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://vocabmaster.app",
    siteName: "VocabMaster",
    title: "VocabMaster - Dil Öğrenmenin Akıllı Yolu",
    description: "Yapay zeka destekli kelime öğrenme platformu. Ezberlemeyi bırak, öğrenmeye başla!",
  },
  twitter: {
    card: "summary_large_image",
    title: "VocabMaster - İngilizce Kelime Öğren",
    description: "AI destekli akıllı tekrar sistemi ile kalıcı kelime öğrenme.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#135bec",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const maintenance = await isMaintenanceMode();
  let isAdmin = false;

  if (maintenance) {
    try {
      const session = await auth();
      if (session?.user?.id) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { role: true },
        });
        isAdmin = user?.role === "ADMIN";
      }
    } catch {
      // ignore
    }
  }

  return (
    <html lang="tr" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen bg-[#0b0f17] text-white`}
        suppressHydrationWarning
      >
        <Providers>
          {maintenance && !isAdmin ? (
            <MaintenancePage />
          ) : (
            <>
              <Navbar />
              <main className="pt-20 pb-12">
                <PageTransition>{children}</PageTransition>
              </main>
              <Footer />
            </>
          )}
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
