import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <Providers>
          <Navbar />
          <main className="pt-20 pb-12">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
