'use client';

import React, { useEffect } from 'react';
import './globals.css';
import { Navbar } from '../components/layout/Navbar';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { useAuthStore } from '../stores/useAuthStore';
import { useLanguageStore } from '../stores/useLanguageStore';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();
  const { language } = useLanguageStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
    if (document.body) {
      document.body.setAttribute('dir', dir);
    }
  }, [language]);

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={language} dir={dir} className="light">
      <head>
        <title>Ahly coin | Real-Time Sports Social Platform</title>
        <meta
          name="description"
          content="Enterprise real-time sports social media platform with live match tracking, instant reactions, and fan engagement."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body dir={dir} className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 pb-20 md:pb-6">{children}</main>
        <MobileBottomNav />
      </body>
    </html>
  );
}
