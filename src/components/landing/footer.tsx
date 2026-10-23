import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-colors text-slate-600 dark:text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <Logo size="lg" href="/" subtitle="Smart scheduling platform" />

            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Smart scheduling for everyone. The 100% free appointment scheduling & meeting management platform.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-brand-500 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-brand-500 transition-colors">How It Works</a></li>
              <li><a href="#comparison" className="hover:text-brand-500 transition-colors">Free vs Paid</a></li>
              <li><Link href="/register" className="hover:text-brand-500 transition-colors">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-4">
              Integrations
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="hover:text-brand-500 cursor-pointer">Google Calendar</span></li>
              <li><span className="hover:text-brand-500 cursor-pointer">Outlook 365</span></li>
              <li><span className="hover:text-brand-500 cursor-pointer">Google Meet</span></li>
              <li><span className="hover:text-brand-500 cursor-pointer">Zoom & Teams</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-4">
              Philosophy
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-brand-500 font-semibold">100% Free Forever</span></li>
              <li><span className="text-slate-500">No Credit Card Needed</span></li>
              <li><span className="text-slate-500">No Monthly Bills</span></li>
              <li><span className="text-slate-500">Privacy First</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Calendio. All rights reserved.</p>
          <p>Crafted for modern professionals worldwide.</p>
        </div>
      </div>
    </footer>
  );
}