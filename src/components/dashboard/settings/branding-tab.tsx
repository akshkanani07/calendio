'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateBrandingSettings } from '@/app/actions/settings.actions';
import { Palette, Sparkles, Check, CheckCircle2, Globe, Eye, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BrandingTabProps {
  initialBrandColor: string;
  initialCustomDomain: string;
  userName: string;
  userUsername: string;
}

const PRESET_COLORS = [
  { hex: '#0069FF', label: 'Calendly Blue' },
  { hex: '#10B981', label: 'Emerald' },
  { hex: '#6366F1', label: 'Indigo' },
  { hex: '#8B5CF6', label: 'Violet' },
  { hex: '#F43F5E', label: 'Rose' },
  { hex: '#F59E0B', label: 'Amber' },
  { hex: '#0F172A', label: 'Slate Dark' },
];

export function BrandingTab({
  initialBrandColor,
  initialCustomDomain,
  userName,
  userUsername,
}: BrandingTabProps) {
  const router = useRouter();
  const [brandColor, setBrandColor] = useState(initialBrandColor || '#0069FF');
  const [customDomain, setCustomDomain] = useState(initialCustomDomain || '');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      const res = await updateBrandingSettings({
        brandColor,
        customDomain,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Branding changes saved successfully!
        </div>
      )}

      {/* Brand Color Selector */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Brand Color Scheme
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose a primary accent color for your booking pages, confirmation buttons, and scheduling slots.
        </p>

        {/* Color Presets */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {PRESET_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setBrandColor(c.hex)}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                brandColor.toLowerCase() === c.hex.toLowerCase()
                  ? 'ring-2 ring-offset-2 ring-brand-500 scale-105 shadow-md'
                  : 'hover:scale-105 opacity-90 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            >
              {brandColor.toLowerCase() === c.hex.toLowerCase() && (
                <Check className="w-4 h-4 text-white stroke-[3]" />
              )}
            </button>
          ))}

          {/* Custom Hex Input */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="h-10 w-10 rounded-xl cursor-pointer bg-transparent border-0 p-0"
              title="Pick custom color"
            />
            <Input
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              placeholder="#0069FF"
              className="w-28 h-10 rounded-xl text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Live Booking Page Mini Preview */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Eye className="w-4 h-4 text-brand-600" />
            Live Public Booking Page Preview
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            calendio.com/{userUsername}
          </span>
        </div>

        {/* Mock Booking Card */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 max-w-md mx-auto space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-md"
              style={{ backgroundColor: brandColor }}
            >
              {userName.charAt(0) || 'C'}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {userName}
              </span>
              <span className="text-[11px] text-slate-400">
                30 Minute Strategy Consultation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 30 min
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Google Meet
            </span>
          </div>

          {/* Sample Selectable Slot with Brand Color */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Select a Time:</span>
            <div className="grid grid-cols-2 gap-2">
              <div
                className="p-2 rounded-xl text-white text-xs font-bold text-center shadow-sm"
                style={{ backgroundColor: brandColor }}
              >
                10:00 AM (Selected)
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-center text-slate-700 dark:text-slate-300">
                11:30 AM
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full h-9 rounded-xl text-white text-xs font-bold shadow-md transition-opacity hover:opacity-95"
            style={{ backgroundColor: brandColor }}
          >
            Confirm Booking &rarr;
          </button>
        </div>
      </div>

      {/* Custom Domain Settings */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Custom Domain & White-Labeling (100% Free)
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Point your custom subdomain (e.g. <span className="font-mono">meet.yourcompany.com</span>) to Calendio.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Custom CNAME Domain
          </label>
          <Input
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="meet.yourcompany.com"
            className="rounded-xl h-10 text-xs font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isLoading}
          className="rounded-xl h-10 px-6 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
        >
          Save Branding Settings
        </Button>
      </div>
    </form>
  );
}
