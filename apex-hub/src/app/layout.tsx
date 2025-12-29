import type { Metadata } from "next";
import { Inter, Newsreader, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Dock } from "@/components/Dock";
import { CommandCenter } from "@/components/CommandCenter";
import { ViewProvider } from "@/context/ViewContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "APEX Hub",
  description: "Your Second Brain for X.com",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable} ${playfair.variable} antialiased bg-[#050505] text-slate-200 min-h-screen relative selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden`}
      >
        {/* The Void - Ambient Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#0F2E2E]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#1E1B4B]/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow delay-1000" />
        </div>

        <ViewProvider>
          <Dock />
          <CommandCenter />
          <main className="w-full min-h-screen pt-12 px-4 md:px-8 lg:px-12 max-w-[1920px] mx-auto pl-24">
            {children}
          </main>
        </ViewProvider>
      </body>
    </html>
  );
}
