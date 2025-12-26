import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApexBar } from "@/components/ApexBar";
import { CommandPalette } from "@/components/CommandPalette";
import { ViewProvider } from "@/context/ViewContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen relative selection:bg-emerald-500/30 selection:text-emerald-200`}
      >
        <ViewProvider>
          <ApexBar />
          <CommandPalette />
          <main className="w-full min-h-screen pt-24 px-4 md:px-8 lg:px-12 max-w-[1920px] mx-auto">
            {children}
          </main>
        </ViewProvider>
      </body>
    </html>
  );
}
