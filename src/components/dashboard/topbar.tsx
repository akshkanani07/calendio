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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LuxuryThemeSwitcher } from '@/components/shared/theme-switcher';
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

  return (
    <>
      <header className="h-16 w-full sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 transition-colors">
        {/* Left: Mobile Toggle & Universal Search */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial">
          {onToggleMobileMenu && (
            <div className="lg:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="h-4 w-4" />
              </button>
              <Logo size="sm" showBadge={false} showText={false} href="/dashboard" />
            </div>
          )}

          {/* Search Input / Command Trigger Button */}
          <div className="w-full sm:w-72 md:w-80">
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

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Create Action */}
          <Link href="/event-types">
            <Button
              size="sm"
              className="h-9 px-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </Link>

          {/* Theme Switcher */}
          <LuxuryThemeSwitcher />

          {/* Real-time Notification Drawer */}
          <NotificationDrawer />

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-brand-500/20 transition-all outline-none"
              >
                <Avatar className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700">
                  <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                  <AvatarFallback className="bg-brand-600 text-white font-bold text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <DropdownMenuLabel className="p-2">
                <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                  {user.name || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                  {user.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild className="rounded-xl text-xs font-semibold cursor-pointer">
                <Link href={`/${user.username || 'me'}`} target="_blank" className="flex items-center justify-between">
                  <span>View Public Page</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="rounded-xl text-xs font-semibold cursor-pointer">
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5 text-slate-400" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

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