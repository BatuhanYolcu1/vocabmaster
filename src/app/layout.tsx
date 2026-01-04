import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen bg-[#0b0f17] text-white font-['Coiny']">
        <Providers>
          <Navbar />
          <main className="pt-24 pb-12">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

