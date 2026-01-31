"use client";

import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  faviconUrl: string;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, setSettings] = useState<SiteSettings>({
    siteTitle: "LinkDirectory",
    siteDescription: "A curated directory of useful links",
    faviconUrl: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  return (
    <html lang="en">
      <head>
        <title>{settings.siteTitle}</title>
        <meta name="description" content={settings.siteDescription} />
        {settings.faviconUrl && (
          <link rel="icon" href={settings.faviconUrl} type="image/x-icon" />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <AuthProvider>
          <header className="bg-white border-b border-slate-200">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-3 items-center h-14">
                <div />
                <Link 
                  href="/" 
                  className="text-lg font-semibold text-slate-900 text-center"
                >
                  {settings.siteTitle}
                </Link>
                <nav className="flex justify-end">
                  <Link
                    href="/blog"
                    className="text-base font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Blog
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
