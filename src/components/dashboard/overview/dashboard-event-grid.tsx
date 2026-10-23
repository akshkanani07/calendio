'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Video,
  Copy,
  Check,
  ExternalLink,
  Plus,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';

interface EventGridProps {
  eventTypes: any[];
  username: string;
}

export function DashboardEventGrid({ eventTypes, username }: EventGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (et: any) => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/${username}/${et.slug}`
      : `/${username}/${et.slug}`;

    navigator.clipboard.writeText(url);
    setCopiedId(et.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" />
            Your Event Types
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Share these links with clients to let them book time with you.
          </p>
        </div>

        <Link
          href="/event-types"
          className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
        >
          View all ({eventTypes.length})
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventTypes.map((et) => {
          const isCopied = copiedId === et.id;
          return (
            <div
              key={et.id}
              className="group p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-brand-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header Swatch & Duration */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: et.color || '#0069FF' }}
                    />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {et.duration} mins
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {et.locationType === 'GOOGLE_MEET' ? 'Google Meet' : et.locationType || 'Video'}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {et.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {et.description || 'One-on-one video call via Google Meet.'}
                </p>
              </div>

              {/* Bottom Actions Bar */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleCopy(et)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <a
                  href={`/${username}/${et.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="Open booking page in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}

        {/* "+ Add New Event" Card */}
        <Link
          href="/event-types"
          className="p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-brand-500/60 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center space-y-2 group transition-all min-h-[160px]"
        >
          <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
            Create Event Type
          </span>
          <span className="text-[11px] text-slate-400">
            One-on-one, group, or round-robin
          </span>
        </Link>
      </div>
    </div>
  );
}
