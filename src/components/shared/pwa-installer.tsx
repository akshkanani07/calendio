'use client';

import React, { useEffect, useState } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / standalone
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true)
    ) {
      setIsStandalone(true);
      return;
    }

    // 2. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Calendio PWA ServiceWorker active:', reg.scope);
          })
          .catch((err) => {
            console.warn('Calendio PWA ServiceWorker registration failed:', err);
          });
      });
    }

    // 3. Listen for BeforeInstallPrompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user previously dismissed today
      const dismissed = sessionStorage.getItem('calendio_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('calendio_pwa_dismissed', 'true');
  };

  if (!showBanner || isStandalone) {
    return null;
  }

  return (
    <aside
      aria-label="Install Calendio Web App"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-brand-500/25">
          <Smartphone className="h-5 w-5 text-white" />
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-white tracking-tight">
              Install Calendio App
            </h4>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-brand-500/30 text-brand-300 border border-brand-500/30">
              PWA
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight mt-1">
            Install on your home screen or desktop for fast, native scheduling & instant notifications.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="h-8 px-3 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-sm flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install Now</span>
            </Button>

            <button
              onClick={handleDismiss}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 font-semibold transition-colors"
            >
              Not now
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}