'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  Search,
  Plus,
  LogOut,
  Settings,
  ExternalLink,
  Menu,
  Sun,
  Moon,
  Gem,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LuxuryThemeSwitcher } from '@/components/shared/theme-switcher';
import { useAppTheme } from '@/components/shared/theme-provider';
import { CommandMenu } from '@/components/dashboard/command-menu';
import { NotificationDrawer } from '@/components/dashboard/notification-drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';
import { Logo } from '@/components/shared/logo';

interface TopbarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  };
  onToggleMobileMenu?: () => void;
}

export function DashboardTopbar({ user, onToggleMobileMenu }: TopbarProps) {
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false);
  const { theme, setTheme } = useAppTheme();

  const publicProfileUrl = user.username ? `/${user.username}` : '/me';

  return (
    <>
      <header className="h-16 w-full sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl flex items-center justify-between px-3 sm:px-6 transition-colors">
        {/* Left: Mobile Toggle, Brand Logo & Desktop Search */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onToggleMobileMenu && (
            <div className="lg:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
                aria-label="Open navigation menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <Logo size="sm" showBadge={false} showText={false} href="/dashboard" />
            </div>
          )}

          {/* Desktop Search / Command Trigger Button (Hidden on Mobile to Prevent Cut-off) */}
          <div className="hidden sm:block sm:w-72 md:w-80">
            <button
              type="button"
              onClick={() => setIsCommandMenuOpen(true)}
              className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between text-xs text-slate-400 shadow-sm group outline-none"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Search className="h-4 w-4 text-slate-400 group-hover:text-brand-500 transition-colors shrink-0" />
                <span className="truncate">Search events, bookings, contacts...</span>
              </div>

              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-xs">
                <span className="text-[11px]">&#8984;</span>K
              </kbd>
            </button>
          </div>
        </div>

        {/* Right Action Icons (Completely Adaptive & Zero Overflow on Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile-only Search Button */}
          <button
            type="button"
            onClick={() => setIsCommandMenuOpen(true)}
            className="sm:hidden h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-brand-500 active:scale-95 transition-all shadow-xs"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Mobile-only Quick Create Event Icon Button */}
          <Link href="/event-types" className="sm:hidden">
            <button
              type="button"
              className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white flex items-center justify-center shadow-sm shadow-brand-500/25 active:scale-95 transition-all"
              aria-label="Create Event"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
            </button>
          </Link>

          {/* Desktop Quick Create Action with Label */}
          <Link href="/event-types" className="hidden sm:inline-flex">
            <Button
              size="sm"
              className="h-9 px-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>Create</span>
            </Button>
          </Link>

          {/* Desktop Theme Switcher (On mobile, theme is available inside profile menu) */}
          <div className="hidden sm:block">
            <LuxuryThemeSwitcher />
          </div>

          {/* Real-time Notification Drawer */}
          <NotificationDrawer />

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 p-0.5 sm:p-1 rounded-full hover:ring-2 hover:ring-brand-500/20 active:scale-95 transition-all outline-none shrink-0"
              >
                <Avatar className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700">
                  <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                  <AvatarFallback className="bg-brand-600 text-white font-bold text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-60 p-1.5 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="p-2.5">
                <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                  {user.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* View Public Page */}
              <DropdownMenuItem asChild className="rounded-xl text-xs font-semibold cursor-pointer">
                <Link
                  href={publicProfileUrl}
                  target="_blank"
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    <span>View Public Page</span>
                  </span>
                  <span className="text-[10px] text-brand-600 dark:text-brand-400 font-mono">Live</span>
                </Link>
              </DropdownMenuItem>

              {/* Account Settings */}
              <DropdownMenuItem asChild className="rounded-xl text-xs font-semibold cursor-pointer">
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>

              {/* Mobile Quick Theme Switcher Row */}
              <div className="sm:hidden px-2 py-2 mt-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <Palette className="h-3 w-3" />
                    <span>Theme</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-all ${
                      theme === 'light'
                        ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    <Sun className="h-3 w-3 text-amber-500" />
                    <span>Light</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('midnight')}
                    className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-all ${
                      theme === 'midnight'
                        ? 'bg-white dark:bg-slate-700 text-sky-400 shadow-xs font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    <Moon className="h-3 w-3 text-sky-400" />
                    <span>Dark</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('executive')}
                    className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[10px] font-medium transition-all ${
                      theme === 'executive'
                        ? 'bg-white dark:bg-slate-700 text-indigo-400 shadow-xs font-bold'
                        : 'text-slate-500'
                    }`}
                  >
                    <Gem className="h-3 w-3 text-indigo-400" />
                    <span>Exec</span>
                  </button>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* Sign Out */}
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer flex items-center gap-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Universal Search / Command Palette */}
      <CommandMenu
        open={isCommandMenuOpen}
        onOpenChange={setIsCommandMenuOpen}
        username={user.username || 'me'}
      />
    </>
  );
}
