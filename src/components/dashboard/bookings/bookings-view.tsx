'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Search,
  Download,
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookingCard } from './booking-card';
import { CancelBookingDialog } from './cancel-booking-dialog';
import { RescheduleBookingDialog } from './reschedule-booking-dialog';
import { useRouter } from 'next/navigation';

interface BookingsViewProps {
  initialUpcoming: any[];
  initialPast: any[];
  initialCancelled: any[];
  counts: {
    upcoming: number;
    past: number;
    cancelled: number;
  };
  username: string;
}

export function BookingsView({
  initialUpcoming,
  initialPast,
  initialCancelled,
  counts,
  username,
}: BookingsViewProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Dialog states
  const [cancellingBooking, setCancellingBooking] = useState<any | null>(null);
  const [reschedulingBooking, setReschedulingBooking] = useState<any | null>(null);

  // Filter current list by search query
  const getActiveList = () => {
    let list: any[] = [];
    if (activeTab === 'upcoming') list = initialUpcoming;
    else if (activeTab === 'past') list = initialPast;
    else if (activeTab === 'cancelled') list = initialCancelled;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter((b) => {
      const nameMatch = b.guestName?.toLowerCase().includes(q);
      const emailMatch = b.guestEmail?.toLowerCase().includes(q);
      const titleMatch = b.eventType?.title?.toLowerCase().includes(q);
      return nameMatch || emailMatch || titleMatch;
    });
  };

  const activeBookings = getActiveList();

  const handleCopyLink = () => {
    const url = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    const list = getActiveList();
    if (list.length === 0) return;

    const headers = ['Event Title', 'Date', 'Start Time', 'End Time', 'Guest Name', 'Guest Email', 'Status', 'Meeting URL'];
    const rows = list.map((b) => [
      `"${b.eventType?.title || 'Meeting'}"`,
      new Date(b.startTime).toISOString().split('T')[0],
      new Date(b.startTime).toLocaleTimeString(),
      new Date(b.endTime).toLocaleTimeString(),
      `"${b.guestName}"`,
      `"${b.guestEmail}"`,
      b.status,
      `"${b.meetingUrl || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `calendio-bookings-${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="h-7 w-7 text-brand-500" />
            Scheduled Events
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            View, manage, reschedule, and cancel all your scheduled meetings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="rounded-xl text-xs font-semibold h-10 px-3.5 flex-1 sm:flex-initial"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                <span>Copy Link</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={activeBookings.length === 0}
            className="rounded-xl text-xs font-semibold h-10 px-3.5 flex-1 sm:flex-initial"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 w-full sm:w-fit overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Upcoming</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'upcoming'
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {counts.upcoming}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'past'
                ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Past</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'past'
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {counts.past}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'cancelled'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Cancelled</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'cancelled'
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}
            >
              {counts.cancelled}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative sm:w-72">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
          <Input
            placeholder="Search by name, email, event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4 pt-2">
        {activeBookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center max-w-lg mx-auto">
            <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {searchQuery
                ? 'No matching meetings found'
                : activeTab === 'upcoming'
                ? 'No upcoming events'
                : activeTab === 'past'
                ? 'No past events'
                : 'No cancelled events'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {searchQuery
                ? 'Try searching with a different term or clear the filter.'
                : activeTab === 'upcoming'
                ? 'Share your scheduling links with colleagues and clients to start booking meetings.'
                : 'Your history will appear here once meetings are held.'}
            </p>

            {activeTab === 'upcoming' && !searchQuery && (
              <div className="mt-5">
                <Button
                  onClick={handleCopyLink}
                  className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs"
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy Booking Link
                </Button>
              </div>
            )}
          </div>
        ) : (
          activeBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={(b) => setCancellingBooking(b)}
              onReschedule={(b) => setReschedulingBooking(b)}
            />
          ))
        )}
      </div>

      {/* Cancel Dialog */}
      <CancelBookingDialog
        isOpen={Boolean(cancellingBooking)}
        booking={cancellingBooking}
        onClose={() => setCancellingBooking(null)}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Reschedule Dialog */}
      <RescheduleBookingDialog
        isOpen={Boolean(reschedulingBooking)}
        booking={reschedulingBooking}
        onClose={() => setReschedulingBooking(null)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
