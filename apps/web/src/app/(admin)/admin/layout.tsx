'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Standalone Layout for /admin/login (No Sidebar / No Top Header Shell)
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Full Admin Dashboard Shell for all other /admin/* routes
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans dir-rtl" dir="rtl">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
