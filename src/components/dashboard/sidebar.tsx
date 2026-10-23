'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Link2,
  CalendarCheck,
  Clock,
  CalendarDays,
  GitFork,
  Workflow,
  Users,
  BarChart3,
  Settings,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Globe,
  ChevronDown,
  X,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/shared/logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';

interface SidebarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
  };
  onOpenCreateModal?: () => void;
  onCloseMobile?: () => void;
}

const navSections = [
  {
    title: 'CORE SCHEDULING',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Event Types', href: '/event-types', icon: Link2 },
      { label: 'Scheduled Events', href: '/bookings', icon: CalendarCheck },
      { label: 'Availability', href: '/availability', icon: Clock },
    ],
  },
  {
    title: 'TEAMS & COLLABORATION',
    items: [
      { label: 'Teams & Round-Robin', href: '/teams', icon: Users },
      { label: 'Contacts CRM', href: '/contacts', icon: UserCheck },
    ],
  },
  {
    title: 'AUTOMATION & ROUTING',
    items: [
      { label: 'Routing Forms', href: '/routing', icon: GitFork },
      { label: 'Workflows', href: '/automations', icon: Workflow },
    ],
  },
  {
    title: 'CONFIGURATION',
    items: [
      { label: 'Calendar Sync', href: '/calendar', icon: CalendarDays },
      { label: 'Analytics', href: '/analytics', icon: BarChart3 },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function DashboardSidebar({ user, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  const copyBookingLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = `${window.location.origin}/${user.username || 'me'}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className="w-64 h-screen sticky top-0 flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl transition-colors select-none shrink-0 z-30">
      <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Brand Header with Luxury Master Logo */}
        <div className="p-4 px-5 shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60">
          <Logo size="md" href="/dashboard" subtitle="Smart Scheduling Platform" />

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Create Event Dropdown CTA */}
        <div className="p-4 pb-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="w-full h-11 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-brand-500/25 flex items-center justify-between px-4 group transition-all"
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
                  <span className="text-xs">Create</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-1.5 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800">
              <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                New Scheduling Asset
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link
                  href="/event-types?new=true"
                  onClick={handleLinkClick}
                  className="cursor-pointer text-xs font-bold rounded-xl py-2 flex items-center gap-2"
                >
                  <Link2 className="h-4 w-4 text-brand-500" />
                  <div>
                    <span className="block font-bold">Event Type</span>
                    <span className="block text-[10px] font-normal text-slate-400">One-on-One or Group meeting</span>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/teams"
                  onClick={handleLinkClick}
                  className="cursor-pointer text-xs font-bold rounded-xl py-2 flex items-center gap-2"
                >
                  <Users className="h-4 w-4 text-indigo-500" />
                  <div>
                    <span className="block font-bold">Team & Round-Robin</span>
                    <span className="block text-[10px] font-normal text-slate-400">Collaborative or rotational link</span>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem asChild>
                <Link
                  href="/routing"
                  onClick={handleLinkClick}
                  className="cursor-pointer text-xs font-semibold rounded-xl py-2 flex items-center gap-2"
                >
                  <GitFork className="h-4 w-4 text-purple-500" />
                  <div>
                    <span className="block font-bold">Routing Form</span>
                    <span className="block text-[10px] font-normal text-slate-400">Qualify and direct invitees</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation Sections (ZERO BADGES) */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400/90 dark:text-slate-500">
                {section.title}
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                      isActive
                        ? 'bg-brand-50/90 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-brand-500" />
                    )}

                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    />

                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Profile & Public Link Capsule */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2 shrink-0">
        {/* Public Booking Link Card */}
        <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex flex-col min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <Globe className="h-3 w-3 text-brand-500" />
              <span>My Booking Link</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-mono mt-0.5">
              /{user.username || 'my-link'}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={copyBookingLink}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-brand-500 transition-colors"
              title={copied ? 'Copied to clipboard' : 'Copy Booking Link'}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <a
              href={`/${user.username || 'me'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-brand-500 transition-colors"
              title="View Public Booking Page"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* User Capsule */}
        <div className="flex items-center justify-between p-1.5 rounded-2xl hover:bg-slate-100/70 dark:hover:bg-slate-900/60 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative">
              <Avatar className="h-8 w-8 rounded-full border border-slate-200 dark:border-slate-700">
                <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                <AvatarFallback className="bg-brand-500 text-white font-bold text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user.name || 'User'}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user.email}
              </span>
            </div>
          </div>

          <Link
            href="/settings"
            onClick={handleLinkClick}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}