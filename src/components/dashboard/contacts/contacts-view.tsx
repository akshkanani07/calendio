'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';
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

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach((c) => {
      (c.tags || []).forEach((t: string) => set.add(t));
    });
    return Array.from(set);
  }, [contacts]);

  // Stats calculation
  const totalContacts = contacts.length;
  const repeatClients = contacts.filter((c) => (c.totalBookings || 0) > 1).length;
  const totalMeetingsLogged = contacts.reduce((sum, c) => sum + (c.totalBookings || 0), 0);

  // Filter & Sort
  const filteredContacts = useMemo(() => {
    return contacts
      .filter((c) => {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.tags && c.tags.some((t: string) => t.toLowerCase().includes(q)));

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

  const handleExportCSV = () => {
    if (filteredContacts.length === 0) return;

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Total Bookings', 'Last Meeting', 'Tags', 'Notes'];
    const rows = filteredContacts.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      c.totalBookings || 0,
      c.lastMeetingAt ? new Date(c.lastMeetingAt).toLocaleDateString() : 'None',
      `"${(c.tags || []).join(', ')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `calendio-contacts-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Contacts CRM
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 border border-brand-200/60 dark:border-brand-900/60">
              <Users className="w-3 h-3" />
              Directory & Notes
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your attendee relationships, meeting history, and private client notes.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            onClick={handleSyncFromBookings}
            disabled={isSyncing}
            className="h-10 px-3.5 rounded-xl text-xs font-semibold hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/40"
            title="Scan bookings and import all guests into CRM"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync from Bookings'}
          </Button>

          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={filteredContacts.length === 0}
            className="h-10 px-3.5 rounded-xl text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>

          <Button
            onClick={() => {
              setEditingContact(null);
              setIsCreateModalOpen(true);
            }}
            className="h-10 px-4 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Sync Feedback Toast Banner */}
      {syncFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-sm animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {syncFeedback}
          </span>
          <button onClick={() => setSyncFeedback(null)} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block">Total Contacts</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{totalContacts}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block">Repeat Clients</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{repeatClients}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block">Meetings Logged</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">{totalMeetingsLogged}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400 block">Auto-Capture</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
              <Check className="w-3.5 h-3.5" />
              Active on Booking
            </span>
          </div>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, company, tag..."
            className="pl-10 h-10 rounded-xl text-xs"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex items-center gap-2">
          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="recent">Sort by: Recent Meeting</option>
            <option value="bookings">Sort by: Most Bookings</option>
            <option value="name">Sort by: Name (A-Z)</option>
            <option value="newest">Sort by: Date Added</option>
          </select>
        </div>
      </div>

      {/* Contacts List / Table */}
      {totalContacts === 0 ? (
        /* Empty State */
        <div className="py-16 px-6 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col items-center max-w-xl mx-auto shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 shadow-inner">
            <Users className="h-8 w-8" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Build your attendee CRM
          </h3>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
            Anyone who schedules a meeting with you is automatically captured here. You can also import
            contacts from previous bookings or manually add new clients and leads.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleSyncFromBookings}
              variant="outline"
              className="rounded-xl h-10 px-5 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Sync from Bookings
            </Button>

            <Button
              onClick={() => {
                setEditingContact(null);
                setIsCreateModalOpen(true);
              }}
              className="rounded-xl h-10 px-5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
            >
              <UserPlus className="w-4 h-4 mr-1.5" />
              Add First Contact
            </Button>
          </div>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          No contacts match "{searchQuery}"
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Tags</th>
                  <th className="py-3.5 px-4">Meetings</th>
                  <th className="py-3.5 px-4">Last Interaction</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Contact Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                          <AvatarFallback className="bg-brand-500 text-white font-bold text-xs">
                            {getInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setActive360ContactId(contact.id);
                              setIs360ModalOpen(true);
                            }}
                            className="font-bold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 text-left transition-colors truncate max-w-[180px] block"
                          >
                            {contact.name}
                          </button>
                          <span className="text-[11px] text-slate-400 truncate max-w-[180px] block">
                            {contact.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                      {contact.company || <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>

                    {/* Tags */}
                    <td className="py-3.5 px-4">
                      {contact.tags && contact.tags.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {contact.tags.map((t: string) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[10px]">No tags</span>
                      )}
                    </td>

                    {/* Total Bookings */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        <CalendarCheck className="w-3 h-3 text-slate-500" />
                        {contact.totalBookings || 0} booking{contact.totalBookings === 1 ? '' : 's'}
                      </span>
                    </td>

                    {/* Last Meeting */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium text-xs">
                      {contact.lastMeetingAt ? (
                        new Date(contact.lastMeetingAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      ) : (
                        <span className="text-slate-400">None yet</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setActive360ContactId(contact.id);
                            setIs360ModalOpen(true);
                          }}
                          className="h-8 px-2.5 rounded-xl text-xs font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/50"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setMessageTargetContact(contact);
                            setIsMessageModalOpen(true);
                          }}
                          className="h-8 w-8 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white"
                          title="Send Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </Button>

                        {/* Options Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-44 rounded-xl p-1 shadow-xl">
                            <DropdownMenuItem
                              onClick={() => {
                                setActive360ContactId(contact.id);
                                setIs360ModalOpen(true);
                              }}
                              className="text-xs font-semibold py-2 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                              View 360 History
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                setEditingContact(contact);
                                setIsCreateModalOpen(true);
                              }}
                              className="text-xs font-semibold py-2 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-2 text-slate-500" />
                              Edit Contact
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => {
                                setMessageTargetContact(contact);
                                setIsMessageModalOpen(true);
                              }}
                              className="text-xs font-semibold py-2 cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5 mr-2 text-slate-500" />
                              Send Email
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setDeleteTargetContact(contact);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-xs font-semibold py-2 cursor-pointer text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/50"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete Contact
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      <CreateContactModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        contact={editingContact}
        onSave={handleSaveContact}
      />

      {/* 360 Details & Notes Modal */}
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

      {/* Direct Email Compose Modal */}
      <SendEmailContactModal
        open={isMessageModalOpen}
        onOpenChange={setIsMessageModalOpen}
        contact={messageTargetContact}
      />

      {/* Delete Confirmation Modal (NO native browser alerts!) */}
      <ConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete this contact?"
        description={`Are you sure you want to delete ${deleteTargetContact?.name} (${deleteTargetContact?.email}) from your CRM? Saved private notes will also be removed. Past bookings will remain safe.`}
        confirmText="Delete Contact"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
