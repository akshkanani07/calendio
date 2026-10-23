'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Video,
  ExternalLink,
  RotateCcw,
  XCircle,
  FileText,
  User,
  Mail,
  MoreVertical,
  X,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  CalendarDays,
  Send,
  Users,
  Phone,
  MapPin,
} from 'lucide-react';
import { getProviderMeta } from '@/lib/meeting-providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BookingCard } from './booking-card';
import { CancelBookingDialog } from './cancel-booking-dialog';
import { RescheduleBookingDialog } from './reschedule-booking-dialog';
import { getInitials, cn } from '@/lib/utils';

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

  // Tab State
  const [activeTab, setActiveTab] = useState<'upcoming' | 'today' | 'past' | 'cancelled' | 'all'>('upcoming');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [sortOrder, setSortOrder] = useState<'SOONEST' | 'LATEST' | 'NAME'>('SOONEST');

  // Layout View Mode: Cards vs Data Table
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Clipboard copy state
  const [copied, setCopied] = useState(false);

  // Selected Booking for 360 Slide-over Drawer
  const [selectedBookingForDrawer, setSelectedBookingForDrawer] = useState<any | null>(null);

  // Dialog States
  const [cancellingBooking, setCancellingBooking] = useState<any | null>(null);
  const [reschedulingBooking, setReschedulingBooking] = useState<any | null>(null);

  // Today Date Boundaries
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayEnd = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  // Combined All Bookings List
  const allCombinedBookings = useMemo(() => {
    const map = new Map<string, any>();
    [...initialUpcoming, ...initialPast, ...initialCancelled].forEach((b) => {
      map.set(b.id, b);
    });
    return Array.from(map.values());
  }, [initialUpcoming, initialPast, initialCancelled]);

  // Today's Bookings
  const todayBookings = useMemo(() => {
    return allCombinedBookings.filter((b) => {
      const start = new Date(b.startTime);
      return b.status !== 'CANCELLED' && start >= todayStart && start <= todayEnd;
    });
  }, [allCombinedBookings, todayStart, todayEnd]);

  // Distinct Event Types list for the filter dropdown
  const distinctEventTypes = useMemo(() => {
    const typesMap = new Map<string, { id: string; title: string; color: string }>();
    allCombinedBookings.forEach((b) => {
      if (b.eventType) {
        typesMap.set(b.eventType.id, {
          id: b.eventType.id,
          title: b.eventType.title,
          color: b.eventType.color || '#0069FF',
        });
      }
    });
    return Array.from(typesMap.values());
  }, [allCombinedBookings]);

  // Calculate Base Tab List
  const baseTabList = useMemo(() => {
    switch (activeTab) {
      case 'upcoming':
        return initialUpcoming;
      case 'today':
        return todayBookings;
      case 'past':
        return initialPast;
      case 'cancelled':
        return initialCancelled;
      case 'all':
        return allCombinedBookings;
      default:
        return initialUpcoming;
    }
  }, [activeTab, initialUpcoming, todayBookings, initialPast, initialCancelled, allCombinedBookings]);

  // Apply Search, Event Type Filter, Date Filter, and Sort Order
  const filteredBookings = useMemo(() => {
    let list = [...baseTabList];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((b) => {
        const nameMatch = b.guestName?.toLowerCase().includes(q);
        const emailMatch = b.guestEmail?.toLowerCase().includes(q);
        const titleMatch = b.eventType?.title?.toLowerCase().includes(q) || b.eventTitle?.toLowerCase().includes(q);
        const notesMatch = b.additionalNotes?.toLowerCase().includes(q);
        return nameMatch || emailMatch || titleMatch || notesMatch;
      });
    }

    // 2. Event Type Filter
    if (selectedEventType !== 'ALL') {
      list = list.filter((b) => b.eventType?.id === selectedEventType || b.eventTypeId === selectedEventType);
    }

    // 3. Date Range Filter
    const now = new Date();
    if (dateRangeFilter === 'TODAY') {
      list = list.filter((b) => {
        const d = new Date(b.startTime);
        return d >= todayStart && d <= todayEnd;
      });
    } else if (dateRangeFilter === 'WEEK') {
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      list = list.filter((b) => {
        const d = new Date(b.startTime);
        return d >= todayStart && d <= weekFromNow;
      });
    } else if (dateRangeFilter === 'MONTH') {
      const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      list = list.filter((b) => {
        const d = new Date(b.startTime);
        return d >= todayStart && d <= monthFromNow;
      });
    }

    // 4. Sort Order
    list.sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      if (sortOrder === 'SOONEST') {
        return timeA - timeB;
      }
      if (sortOrder === 'LATEST') {
        return timeB - timeA;
      }
      if (sortOrder === 'NAME') {
        return (a.guestName || '').localeCompare(b.guestName || '');
      }
      return 0;
    });

    return list;
  }, [baseTabList, searchQuery, selectedEventType, dateRangeFilter, sortOrder, todayStart, todayEnd]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalMinutes = 0;
    allCombinedBookings.forEach((b) => {
      if (b.status !== 'CANCELLED') {
        const start = new Date(b.startTime).getTime();
        const end = new Date(b.endTime).getTime();
        const mins = Math.max(0, (end - start) / (1000 * 60));
        totalMinutes += mins || b.eventDuration || 30;
      }
    });

    const hours = Math.round((totalMinutes / 60) * 10) / 10;
    const confirmedCount = initialUpcoming.length;
    const completedCount = initialPast.length;

    return {
      totalHours: hours,
      confirmedCount,
      completedCount,
      totalCount: allCombinedBookings.length,
      todayCount: todayBookings.length,
    };
  }, [allCombinedBookings, initialUpcoming, initialPast, todayBookings]);

  // Copy Public Booking Link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/${username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    if (filteredBookings.length === 0) return;

    const headers = [
      'Booking ID',
      'Event Title',
      'Date',
      'Start Time',
      'End Time',
      'Duration (Mins)',
      'Guest Name',
      'Guest Email',
      'Guest Timezone',
      'Status',
      'Google Meet URL',
      'Meeting Notes',
    ];

    const rows = filteredBookings.map((b) => [
      `"${b.id}"`,
      `"${b.eventType?.title || b.eventTitle || 'Meeting'}"`,
      new Date(b.startTime).toISOString().split('T')[0],
      new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      b.eventDuration || 30,
      `"${b.guestName || ''}"`,
      `"${b.guestEmail || ''}"`,
      `"${b.guestTimeZone || ''}"`,
      b.status,
      `"${b.meetingUrl || ''}"`,
      `"${(b.additionalNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `calendio-bookings-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* ============================================================ */}
      {/* 1. Header Section with Quick Actions & Share Link */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60 dark:border-brand-900/60">
              <Sparkles className="w-3 h-3 text-brand-500" />
              Scheduling Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 mt-1">
            <CalendarCheck className="h-7 w-7 text-brand-500" />
            <span>Scheduled Events</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time management, video links, attendee logs, and calendar sync.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="rounded-2xl text-xs font-semibold h-10 px-4 bg-white dark:bg-slate-900 shadow-xs hover:border-brand-500 flex-1 sm:flex-initial"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                <span>Copy Booking Link</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredBookings.length === 0}
            className="rounded-2xl text-xs font-semibold h-10 px-4 bg-white dark:bg-slate-900 shadow-xs hover:border-brand-500 flex-1 sm:flex-initial"
          >
            <Download className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
            <span>Export CSV</span>
          </Button>

          <Link href="/event-types">
            <Button
              size="sm"
              className="h-10 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-brand-500/20"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5 stroke-[3]" />
              <span className="hidden sm:inline">New Event Type</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. Key Metrics Pulse Banner */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Upcoming Calls
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.confirmedCount}
            </span>
            <Badge variant="secondary" className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950/60 font-mono">
              Ready
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {metrics.todayCount} meeting{metrics.todayCount === 1 ? '' : 's'} scheduled today
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Completed Meetings
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.completedCount}
            </span>
            <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 font-mono">
              Past
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Historical meeting records
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Meeting Time Spent
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.totalHours} <span className="text-sm font-normal text-slate-400">hrs</span>
            </span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Total call duration tracked
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cancellation Rate
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {metrics.totalCount > 0
                ? `${Math.round((counts.cancelled / metrics.totalCount) * 100)}%`
                : '0%'}
            </span>
            <Badge variant="outline" className="text-[10px] text-slate-400 font-mono">
              {counts.cancelled} cancelled
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Automated conflict protection
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. Navigation Tabs, Search Bar & Filters */}
      {/* ============================================================ */}
      <div className="space-y-3">
        {/* Navigation Tabs Pill */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95',
                activeTab === 'upcoming'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <span>Upcoming</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-brand-50 dark:bg-brand-950/60 font-mono">
                {counts.upcoming}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('today')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95',
                activeTab === 'today'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <span>Today</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 font-mono">
                {todayBookings.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('past')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95',
                activeTab === 'past'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <span>Past</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 font-mono">
                {counts.past}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cancelled')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95',
                activeTab === 'cancelled'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <span>Cancelled</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 font-mono">
                {counts.cancelled}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95',
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <span>All</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 font-mono">
                {allCombinedBookings.length}
              </span>
            </button>
          </div>

          {/* View Mode Toggle: Cards vs Table */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              )}
              title="Cards View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              )}
              title="List / Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Input & Dropdown Filters Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Universal Search Input */}
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
            <Input
              placeholder="Search by attendee name, email, event, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Event Type Filter Dropdown */}
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="h-10 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="ALL">All Event Types</option>
            {distinctEventTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          {/* Sort Order Dropdown */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="h-10 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="SOONEST">Date: Soonest First</option>
            <option value="LATEST">Date: Latest First</option>
            <option value="NAME">Guest: A to Z</option>
          </select>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. Bookings Display Area (Cards or Data Table) */}
      {/* ============================================================ */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto shadow-xs">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              No meetings found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              {searchQuery || selectedEventType !== 'ALL'
                ? 'Try adjusting your search terms or filters.'
                : 'Share your booking link to begin receiving scheduled meetings.'}
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="rounded-xl text-xs font-semibold"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy Public Link
            </Button>
            <Link href="/event-types">
              <Button size="sm" className="rounded-xl text-xs font-semibold bg-brand-600 text-white">
                View Event Types
              </Button>
            </Link>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* Visual Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => setSelectedBookingForDrawer(booking)}
              className="cursor-pointer transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              <BookingCard
                booking={booking}
                onCancel={(b) => setCancellingBooking(b)}
                onReschedule={(b) => setReschedulingBooking(b)}
              />
            </div>
          ))}
        </div>
      ) : (
        /* High-Density Data Table View */
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Attendee</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Meeting Link</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredBookings.map((b) => {
                  const start = new Date(b.startTime);
                  const end = new Date(b.endTime);

                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBookingForDrawer(b)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-extrabold text-slate-900 dark:text-white">
                          {start.toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short',
                          })}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>

                      {/* Attendee */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-brand-500 text-white font-bold text-[10px]">
                              {getInitials(b.guestName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {b.guestName}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{b.guestEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Event Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: b.eventType?.color || '#0069FF' }}
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {b.eventType?.title || b.eventTitle || 'Meeting'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-md',
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : b.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                          )}
                        >
                          {b.status}
                        </Badge>
                      </td>

                      {/* Video / Location Link */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {b.meetingUrl ? (() => {
                          const pMeta = getProviderMeta(b.locationType || b.eventType?.locationType || 'GOOGLE_MEET');
                          const IconComp = pMeta.category === 'phone' ? Phone : pMeta.category === 'in_person' ? MapPin : Video;
                          const label = pMeta.category === 'in_person' ? 'Map' : pMeta.category === 'phone' ? 'Call' : pMeta.name.split(' ')[0];
                          return (
                            <a
                              href={b.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-bold hover:underline text-xs"
                            >
                              <IconComp className="h-3.5 w-3.5" />
                              <span>Join {label}</span>
                            </a>
                          );
                        })() : (
                          <span className="text-slate-400 text-[11px]">No link</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReschedulingBooking(b)}
                            className="h-8 px-2.5 text-xs rounded-lg"
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancellingBooking(b)}
                            className="h-8 px-2.5 text-xs rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MEETING 360 SLIDE-OVER DRAWER */}
      {/* ============================================================ */}
      {selectedBookingForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedBookingForDrawer(null)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-10 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-brand-500" />
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Meeting Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBookingForDrawer(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Event Title Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        selectedBookingForDrawer.eventType?.color || '#0069FF',
                    }}
                  />
                  <h4 className="font-black text-lg text-slate-900 dark:text-white">
                    {selectedBookingForDrawer.eventType?.title ||
                      selectedBookingForDrawer.eventTitle}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <Badge variant="secondary" className="px-2.5 py-0.5 rounded-md text-[11px]">
                    <Clock className="w-3 h-3 mr-1" />
                    {selectedBookingForDrawer.eventDuration || 30} mins
                  </Badge>

                  <Badge
                    variant="secondary"
                    className={cn(
                      'px-2.5 py-0.5 rounded-md text-[11px] font-bold',
                      selectedBookingForDrawer.status === 'CONFIRMED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60'
                    )}
                  >
                    {selectedBookingForDrawer.status}
                  </Badge>
                </div>
              </div>

              {/* Time & Date */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Scheduled Time
                </p>
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {new Date(selectedBookingForDrawer.startTime).toLocaleDateString([], {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                      {new Date(selectedBookingForDrawer.startTime).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}{' '}
                      -{' '}
                      {new Date(selectedBookingForDrawer.endTime).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Attendee Timezone: {selectedBookingForDrawer.guestTimeZone || 'Local'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendee Info Card */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Attendee Information
                </p>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-brand-600 text-white font-bold">
                        {getInitials(selectedBookingForDrawer.guestName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {selectedBookingForDrawer.guestName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {selectedBookingForDrawer.guestEmail}
                      </p>
                    </div>
                  </div>

                  {selectedBookingForDrawer.additionalGuests &&
                    selectedBookingForDrawer.additionalGuests.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>Additional Attendees</span>
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {selectedBookingForDrawer.additionalGuests.map((em: string) => (
                            <span
                              key={em}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-[10px] font-mono text-slate-700 dark:text-slate-300"
                            >
                              {em}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Meeting Link & Conferencing Card */}
              {selectedBookingForDrawer.meetingUrl && (() => {
                const drawerMeta = getProviderMeta(selectedBookingForDrawer.locationType || selectedBookingForDrawer.eventType?.locationType || 'GOOGLE_MEET');
                const DrawerIcon = drawerMeta.category === 'phone' ? Phone : drawerMeta.category === 'in_person' ? MapPin : Video;
                const dDetails = selectedBookingForDrawer.locationDetails || {};

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {drawerMeta.name}
                      </p>
                      <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-md border-0 ${drawerMeta.badgeBg} ${drawerMeta.badgeText}`}>
                        {drawerMeta.category.toUpperCase()}
                      </Badge>
                    </div>

                    <a
                      href={selectedBookingForDrawer.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50/50 dark:from-brand-950/40 dark:to-indigo-950/20 border border-brand-200/80 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-bold text-xs hover:scale-[1.01] transition-transform shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <DrawerIcon className="h-4 w-4 text-brand-600" />
                        <span>{drawerMeta.joinButtonText}</span>
                      </div>
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    {(dDetails.meetingId || dDetails.passcode || dDetails.dialIn || dDetails.address) && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                        {dDetails.meetingId && <div><span className="text-slate-400 font-bold">Meeting ID:</span> <span className="font-mono">{dDetails.meetingId}</span></div>}
                        {dDetails.passcode && <div><span className="text-slate-400 font-bold">Passcode:</span> <span className="font-mono">{dDetails.passcode}</span></div>}
                        {dDetails.dialIn && <div><span className="text-slate-400 font-bold">Dial-In:</span> {dDetails.dialIn}</div>}
                        {dDetails.address && <div><span className="text-slate-400 font-bold">Venue:</span> {dDetails.address}</div>}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Meeting Notes */}
              {selectedBookingForDrawer.additionalNotes && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Attendee Notes & Agenda
                  </p>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {selectedBookingForDrawer.additionalNotes}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-2xl h-11 text-xs font-bold"
                onClick={() => {
                  const b = selectedBookingForDrawer;
                  setSelectedBookingForDrawer(null);
                  setReschedulingBooking(b);
                }}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Reschedule
              </Button>

              <Button
                variant="destructive"
                className="flex-1 rounded-2xl h-11 text-xs font-bold bg-rose-600 hover:bg-rose-700"
                onClick={() => {
                  const b = selectedBookingForDrawer;
                  setSelectedBookingForDrawer(null);
                  setCancellingBooking(b);
                }}
              >
                <XCircle className="h-3.5 w-3.5 mr-1.5" />
                Cancel Event
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Dialog Modal */}
      {cancellingBooking && (
        <CancelBookingDialog
          isOpen={!!cancellingBooking}
          onClose={() => setCancellingBooking(null)}
          booking={cancellingBooking}
          onSuccess={() => {
            setCancellingBooking(null);
            router.refresh();
          }}
        />
      )}

      {/* Reschedule Booking Dialog Modal */}
      {reschedulingBooking && (
        <RescheduleBookingDialog
          isOpen={!!reschedulingBooking}
          onClose={() => setReschedulingBooking(null)}
          booking={reschedulingBooking}
          onSuccess={() => {
            setReschedulingBooking(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
