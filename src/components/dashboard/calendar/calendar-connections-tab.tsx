'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { IntegrationType } from '@prisma/client';
import {
  Calendar,
  CalendarDays,
  ShieldCheck,
  Plus,
  Copy,
  Check,
} from 'lucide-react';

interface CalendarConnectionsTabProps {
  userId: string;
  calendars: any[];
  onToggleConflict: (calendarId: string, currentVal: boolean) => void;
  onSetPrimary: (calendarId: string) => void;
  onRequestDisconnect: (calendar: any) => void;
  onOpenConnectModal: (provider: IntegrationType) => void;
}

export function CalendarConnectionsTab({
  userId,
  calendars,
  onToggleConflict,
  onSetPrimary,
  onRequestDisconnect,
  onOpenConnectModal,
}: CalendarConnectionsTabProps) {
  const [feedCopied, setFeedCopied] = useState(false);

  const calendarFeedUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/calendar/feed/${userId}`
    : `/api/calendar/feed/${userId}`;

  const copyFeedUrl = () => {
    navigator.clipboard.writeText(calendarFeedUrl);
    setFeedCopied(true);
    setTimeout(() => setFeedCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* How Conflicts Work Banner */}
      <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/50 flex items-start gap-3.5">
        <div className="h-9 w-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-brand-500/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            How Calendio Prevents Double-Booking
          </h4>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            When an invitee looks at your booking page, Calendio checks your connected calendars in real time.
            If you have an appointment, personal block, or meeting on Google Calendar or Outlook, those slots are instantly blocked on Calendio.
          </p>
        </div>
      </div>

      {/* Connected Calendars List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Connected Calendars ({calendars.length})
        </h3>

        <div className="space-y-3">
          {calendars.map((cal) => (
            <div
              key={cal.id}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {cal.provider === 'GOOGLE_CALENDAR'
                        ? 'Google Calendar'
                        : cal.provider === 'OUTLOOK_CALENDAR'
                        ? 'Microsoft Outlook 365'
                        : 'Apple iCloud Calendar'}
                    </span>

                    {cal.isPrimary && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60">
                        Primary
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-400 block mt-0.5 font-mono">
                    {cal.accountEmail}
                  </span>
                </div>
              </div>

              {/* Actions & Conflict Switch */}
              <div className="flex items-center gap-6 self-end sm:self-center">
                <div className="flex items-center gap-2.5">
                  <Switch
                    checked={cal.checkConflicts}
                    onCheckedChange={() => onToggleConflict(cal.id, cal.checkConflicts)}
                    id={`conflict-${cal.id}`}
                  />
                  <label
                    htmlFor={`conflict-${cal.id}`}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Check for conflicts
                  </label>
                </div>

                {!cal.isPrimary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetPrimary(cal.id)}
                    className="h-8 px-2.5 text-xs font-semibold text-slate-600 hover:text-brand-600"
                  >
                    Make Primary
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRequestDisconnect(cal)}
                  className="h-8 px-2.5 text-xs font-semibold text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Another Calendar Account */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Connect Another Calendar
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Google Calendar */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                G
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Google Calendar</h4>
                <span className="text-[11px] text-slate-400">Personal & Workspace</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenConnectModal(IntegrationType.GOOGLE_CALENDAR)}
              className="w-full h-8 text-xs font-bold rounded-xl"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Connect
            </Button>
          </div>

          {/* Microsoft Outlook */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                O
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Outlook / Office 365</h4>
                <span className="text-[11px] text-slate-400">Hotmail, Live & Enterprise</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenConnectModal(IntegrationType.OUTLOOK_CALENDAR)}
              className="w-full h-8 text-xs font-bold rounded-xl"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Connect
            </Button>
          </div>

          {/* Apple Calendar */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Apple iCloud</h4>
                <span className="text-[11px] text-slate-400">iPhone, iPad & Mac</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenConnectModal(IntegrationType.APPLE_CALENDAR)}
              className="w-full h-8 text-xs font-bold rounded-xl"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Connect
            </Button>
          </div>
        </div>
      </div>

      {/* Live Webcal / ICS Calendar Feed */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Live Calendar Subscription Feed (Webcal / .ICS)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Subscribe to your Calendio schedule in any calendar app (Apple Calendar on iPhone/Mac, Thunderbird, Google Calendar, Outlook) without logging in.
              </p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 shrink-0">
            RFC 5545 Live
          </span>
        </div>

        {/* URL Display Bar */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
          <input
            type="text"
            readOnly
            value={calendarFeedUrl}
            className="flex-1 bg-transparent text-xs font-mono text-slate-700 dark:text-slate-300 outline-none px-2 select-all"
          />
          <Button
            size="sm"
            onClick={copyFeedUrl}
            className="h-8 px-3 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shrink-0"
          >
            {feedCopied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-300" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy Subscription URL
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
