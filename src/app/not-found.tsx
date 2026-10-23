import React from 'react';
import Link from 'next/link';
import { CalendarX2, ArrowLeft, Home, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-6 sm:p-12 transition-colors">
      <header className="max-w-4xl mx-auto w-full flex justify-between items-center">
        <Logo size="md" href="/" />
      </header>

      <main className="max-w-md mx-auto w-full text-center space-y-6 py-12">
        <div className="h-20 w-20 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-sm border border-brand-200/50 dark:border-brand-900/40">
          <CalendarX2 className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <span>404</span>
            <span>&bull;</span>
            <span>Page Not Found</span>
          </span>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Lost on your schedule?
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            The page, user profile, or booking link you are trying to visit doesn&apos;t exist or may have been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/20">
              <Home className="h-4 w-4 mr-1.5" />
              Go to Dashboard
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto h-11 px-6 rounded-2xl text-xs font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Home Page
            </Button>
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Calendio. Smart Scheduling for Everyone.
      </footer>
    </div>
  );
}
