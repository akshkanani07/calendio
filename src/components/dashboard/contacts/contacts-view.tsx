'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { CreateContactModal } from './create-contact-modal';
import { Contact360Modal } from './contact-360-modal';
import { SendEmailContactModal } from './send-email-contact-modal';
import {
  createContact,
  updateContact,
  deleteContact,
  syncContactsFromBookings,
} from '@/app/actions/contact.actions';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  CalendarCheck,
  Sparkles,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  Send,
  Eye,
  Check,
  CheckCircle2,
  LayoutGrid,
  List,
  Tag,
  ArrowUpDown,
  X,
  FileSpreadsheet,
  Clock,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ContactsViewProps {
  initialContacts: any[];
}

export function ContactsView({ initialContacts }: ContactsViewProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState<any[]>(initialContacts || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'bookings' | 'name' | 'newest'>('recent');

  // Layout View Mode: Table vs Visual Grid Cards
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Multi-Selection State for Batch Operations
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);

  const [active360ContactId, setActive360ContactId] = useState<string | null>(null);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);

  const [messageTargetContact, setMessageTargetContact] = useState<any | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const [deleteTargetContact, setDeleteTargetContact] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Extract all unique tags with count
  const tagCounts = useMemo(() => {
    const map = new Map<string, number>();
    contacts.forEach((c) => {
      (c.tags || []).forEach((t: string) => {
        map.set(t, (map.get(t) || 0) + 1);
      });
    });
    return Array.from(map.entries()).map(([tag, count]) => ({ tag, count }));
  }, [contacts]);

  // Aggregate Stats
  const totalContacts = contacts.length;
  const repeatClients = contacts.filter((c) => (c.totalBookings || 0) > 1).length;
  const totalMeetingsLogged = contacts.reduce((sum, c) => sum + (c.totalBookings || 0), 0);
  const repeatRate = totalContacts > 0 ? Math.round((repeatClients / totalContacts) * 100) : 0;

  // Filter & Sort
  const filteredContacts = useMemo(() => {
    return contacts
      .filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.tags && c.tags.some((t: string) => t.toLowerCase().includes(q))) ||
          (c.notes && c.notes.toLowerCase().includes(q));

        const matchesTag = selectedTag === 'ALL' || (c.tags && c.tags.includes(selectedTag));

        return matchesQuery && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'bookings') return (b.totalBookings || 0) - (a.totalBookings || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // default 'recent'
        const timeA = a.lastMeetingAt ? new Date(a.lastMeetingAt).getTime() : 0;
        const timeB = b.lastMeetingAt ? new Date(b.lastMeetingAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [contacts, searchQuery, selectedTag, sortBy]);

  // Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContactIds(filteredContacts.map((c) => c.id));
    } else {
      setSelectedContactIds([]);
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((item) => item !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  // Handlers
  const handleSaveContact = async (data: any) => {
    if (data.id) {
      await updateContact(data.id, data);
    } else {
      await createContact(data);
    }
    router.refresh();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetContact) return;
    await deleteContact(deleteTargetContact.id);
    setContacts((prev) => prev.filter((c) => c.id !== deleteTargetContact.id));
    setDeleteTargetContact(null);
    router.refresh();
  };

  const handleSyncFromBookings = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncContactsFromBookings();
      if (res.success) {
        setSyncFeedback(res.message || 'Contacts synced successfully!');
        setTimeout(() => setSyncFeedback(null), 3500);
        router.refresh();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Export CSV Handler
  const handleExportCSV = (exportSelectedOnly = false) => {
    const listToExport = exportSelectedOnly
      ? contacts.filter((c) => selectedContactIds.includes(c.id))
      : filteredContacts;

    if (listToExport.length === 0) return;

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Total Bookings', 'Last Meeting', 'Tags', 'Notes'];
    const rows = listToExport.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      c.totalBookings || 0,
      c.lastMeetingAt ? new Date(c.lastMeetingAt).toLocaleDateString() : 'None',
      `"${(c.tags || []).join(', ')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `calendio-contacts-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto animate-fade-in">
      {/* ============================================================ */}
      {/* 1. Header Section */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60">
              <Sparkles className="w-3 h-3 text-purple-500" />
              Integrated Relationship Intelligence
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 mt-1">
            <Users className="w-7 h-7 text-brand-600" />
            <span>Contacts CRM</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Auto-captures every attendee from your bookings. Add private notes, tags, and meeting logs.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncFromBookings}
            disabled={isSyncing}
            className="rounded-2xl text-xs font-semibold h-10 px-4 bg-white dark:bg-slate-900 shadow-xs"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', isSyncing && 'animate-spin')} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Bookings'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportCSV(false)}
            disabled={filteredContacts.length === 0}
            className="rounded-2xl text-xs font-semibold h-10 px-4 bg-white dark:bg-slate-900 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setEditingContact(null);
              setIsCreateModalOpen(true);
            }}
            className="rounded-2xl text-xs font-bold h-10 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-md shadow-brand-500/20"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5 stroke-[3]" />
            <span>New Contact</span>
          </Button>
        </div>
      </div>

      {/* Sync Success Feedback Banner */}
      {syncFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. Key Metrics Summary Grid */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total CRM Contacts
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalContacts}
            </span>
            <Users className="w-4 h-4 text-brand-500" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Unique meeting participants
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Meetings Logged
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalMeetingsLogged}
            </span>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Across all event types
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Repeat Client Rate
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {repeatRate}%
            </span>
            <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-600 font-mono">
              {repeatClients} clients
            </Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Multiple meetings booked
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Categorized Tags
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {tagCounts.length}
            </span>
            <Tag className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            Lead segments & tiers
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. Search Bar, Tag Filters & View Mode Switcher */}
      {/* ============================================================ */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <Input
              placeholder="Search by name, email, company, tags, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 px-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="recent">Sort: Last Meeting</option>
              <option value="bookings">Sort: Most Bookings</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="newest">Sort: Newly Added</option>
            </select>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                )}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
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
            </div>
          </div>
        </div>

        {/* Tag Filters Pill Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedTag('ALL')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95',
              selectedTag === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-500'
            )}
          >
            All Contacts ({totalContacts})
          </button>

          {tagCounts.map(({ tag, count }) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95',
                selectedTag === tag
                  ? 'bg-brand-600 text-white shadow-2xs font-bold'
                  : 'bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-500'
              )}
            >
              <span>{tag}</span>
              <span className="text-[10px] font-mono opacity-80">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Multi-Select Batch Actions Bar */}
      {selectedContactIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-slate-900 text-white shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2 pl-2">
            <span className="text-xs font-bold">{selectedContactIds.length} contact(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExportCSV(true)}
              className="h-8 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Export Selected
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedContactIds([])}
              className="h-8 text-xs text-slate-300 hover:text-white rounded-xl"
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. Contacts Display: Table vs Visual Cards */}
      {/* ============================================================ */}
      {filteredContacts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            No contacts match your criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedTag !== 'ALL'
              ? 'Try resetting the search or tag filters.'
              : 'Sync from existing bookings or add a contact manually.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedContactIds.length > 0 &&
                        selectedContactIds.length === filteredContacts.length
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-brand-600 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Meetings</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredContacts.map((c) => {
                  const isChecked = selectedContactIds.includes(c.id);

                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors',
                        isChecked && 'bg-brand-50/40 dark:bg-brand-950/20'
                      )}
                      onClick={() => {
                        setActive360ContactId(c.id);
                        setIs360ModalOpen(true);
                      }}
                    >
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelectOne(c.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectOne(c.id)}
                          className="rounded border-slate-300 text-brand-600 cursor-pointer"
                        />
                      </td>

                      {/* Name & Email */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-brand-600 text-white font-bold text-xs">
                              {getInitials(c.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Company & Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.company ? (
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">
                              {c.company}
                            </p>
                            {c.role && (
                              <p className="text-[11px] text-slate-400">{c.role}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Meetings & Last Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="font-mono text-[10px] font-bold px-2 py-0.5"
                          >
                            {c.totalBookings || 0} calls
                          </Badge>
                          {c.lastMeetingAt && (
                            <span className="text-[11px] text-slate-400">
                              Last: {new Date(c.lastMeetingAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {(c.tags || []).slice(0, 3).map((t: string) => (
                            <Badge
                              key={t}
                              variant="outline"
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg border-slate-200 dark:border-slate-700"
                            >
                              {t}
                            </Badge>
                          ))}
                          {(c.tags || []).length > 3 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              +{c.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl text-slate-400 hover:text-brand-600"
                            onClick={() => {
                              setMessageTargetContact(c);
                              setIsMessageModalOpen(true);
                            }}
                            title="Send Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-xl text-slate-400"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 rounded-2xl p-1 shadow-xl">
                              <DropdownMenuItem
                                onClick={() => {
                                  setActive360ContactId(c.id);
                                  setIs360ModalOpen(true);
                                }}
                                className="text-xs font-semibold py-2 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                <span>360 History</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingContact(c);
                                  setIsCreateModalOpen(true);
                                }}
                                className="text-xs font-semibold py-2 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                <span>Edit Contact</span>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => {
                                  setDeleteTargetContact(c);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="text-xs font-semibold py-2 cursor-pointer text-rose-600 focus:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                <span>Delete Contact</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setActive360ContactId(c.id);
                setIs360ModalOpen(true);
              }}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group active:scale-95"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-brand-600 text-white font-bold">
                      {getInitials(c.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                      {c.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono truncate max-w-[170px]">
                      {c.email}
                    </p>
                  </div>
                </div>

                <Badge variant="secondary" className="text-[10px] font-mono">
                  {c.totalBookings || 0} mtgs
                </Badge>
              </div>

              {c.company && (
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{c.company}</span>
                  {c.role && <span className="text-slate-400">({c.role})</span>}
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {(c.tags || []).map((t: string) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-lg border-slate-200 dark:border-slate-700"
                  >
                    {t}
                  </Badge>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px]">
                  {c.lastMeetingAt
                    ? `Last call: ${new Date(c.lastMeetingAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}`
                    : 'No past calls'}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMessageTargetContact(c);
                    setIsMessageModalOpen(true);
                  }}
                  className="h-8 px-2.5 text-xs font-semibold text-brand-600 hover:bg-brand-50"
                >
                  <Mail className="w-3.5 h-3.5 mr-1" />
                  Email
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. Modals: Create/Edit, 360 Drawer, Send Email, Confirm Delete */}
      {/* ============================================================ */}
      <CreateContactModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        contact={editingContact}
        onSave={handleSaveContact}
      />

      <Contact360Modal
        open={is360ModalOpen}
        onOpenChange={setIs360ModalOpen}
        contactId={active360ContactId}
        onEdit={(c) => {
          setEditingContact(c);
          setIsCreateModalOpen(true);
        }}
        onDeleteRequest={(c) => {
          setDeleteTargetContact(c);
          setIsDeleteModalOpen(true);
        }}
        onSendEmailRequest={(c) => {
          setMessageTargetContact(c);
          setIsMessageModalOpen(true);
        }}
      />

      <SendEmailContactModal
        open={isMessageModalOpen}
        onOpenChange={setIsMessageModalOpen}
        contact={messageTargetContact}
      />

      <ConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Contact"
        description={`Are you sure you want to delete ${deleteTargetContact?.name}? Their attendee history and private notes will be removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
