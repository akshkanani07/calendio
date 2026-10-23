'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from './sidebar';
import { DashboardTopbar } from './topbar';
import { MobileBottomNav } from './mobile-bottom-nav';

interface DashboardLayoutClientProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  };
  children: React.ReactNode;
}

export function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* 1. Desktop Sidebar (Sticky, lg:flex, hidden on mobile) */}
      <div className="hidden lg:block shrink-0">
        <DashboardSidebar user={user} />
      </div>

      {/* 2. Mobile Drawer Sidebar (slide-over with backdrop) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-950 shadow-2xl z-10 animate-in slide-in-from-left duration-250">
            <DashboardSidebar user={user} onCloseMobile={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Topbar with search, notifications, mobile hamburger */}
        <DashboardTopbar
          user={user}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
        />

        {/* Dynamic Page Content with bottom safe-area for mobile dock */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-8 transition-all">
          {children}
        </main>

        {/* 4. Ultra-Premium Floating Mobile Bottom Navigation Dock */}
        <MobileBottomNav
          user={user}
          onOpenDrawer={() => setIsMobileOpen(true)}
        />
      </div>
    </div>
  );
}
