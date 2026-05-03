// src/app/layout.tsx
// root layout — loads fonts, applies providers, renders navbar

import type { Metadata } from "next";
import {
  Syne,
  Cormorant_Garamond,
  IBM_Plex_Mono,
  Bricolage_Grotesque,
  Geist_Mono,
  Inter,
} from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["600", "700"],
  display: "swap",
  style: ["italic"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-data",
  weight: ["400", "500"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-ui",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-label",
  weight: ["400", "500"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevFlow — Developer Productivity Dashboard",
  description:
    "Turn raw engineering metrics into actionable insights. See your lead time, cycle time, bug rate, and more — with context that actually helps.",
  keywords: ["developer productivity", "DORA metrics", "engineering metrics", "devops"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${cormorant.variable} ${ibmPlexMono.variable} ${bricolage.variable} ${geistMono.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-body">
        <ThemeProvider>
          <div className="grain-overlay" aria-hidden />
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            {children}
          </main>
          <Toaster position="bottom-right" theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}
