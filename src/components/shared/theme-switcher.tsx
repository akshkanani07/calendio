'use client';

import React from 'react';
import { useAppTheme, AppTheme } from './theme-provider';
import { Sun, Moon, Gem } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function LuxuryThemeSwitcher() {
  const { theme, setTheme } = useAppTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:scale-105 transition-all"
          title="Switch Theme"
        >
          {theme === 'light' && <Sun className="h-4 w-4 text-amber-500" />}
          {theme === 'midnight' && <Moon className="h-4 w-4 text-sky-400" />}
          {theme === 'executive' && <Gem className="h-4 w-4 text-indigo-400" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
            <Sun className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className={theme === 'light' ? 'text-brand-600 font-bold' : ''}>Pristine Light</span>
            <span className="text-[10px] text-slate-400 font-normal">Classic Calendly white</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('midnight')}
          className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <div className="h-7 w-7 rounded-lg bg-sky-950 text-sky-400 flex items-center justify-center">
            <Moon className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className={theme === 'midnight' ? 'text-sky-400 font-bold' : ''}>Midnight Obsidian</span>
            <span className="text-[10px] text-slate-400 font-normal">Deep OLED dark space</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('executive')}
          className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <div className="h-7 w-7 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center">
            <Gem className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className={theme === 'executive' ? 'text-indigo-400 font-bold' : ''}>Executive Indigo</span>
            <span className="text-[10px] text-slate-400 font-normal">Velvet SaaS look</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
