'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Building2,
  Tag,
  Video,
  FileText,
  Send,
  Edit2,
  Trash2,
  ExternalLink,
  Check,
  Sparkles,
  CheckCircle2,
  XCircle,
  CalendarCheck,
} from 'lucide-react';
import { getContactDetails, updateContact } from '@/app/actions/contact.actions';
import { getInitials } from '@/lib/utils';

interface Contact360ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string | null;
  onEdit: (contact: any) => void;
  onDeleteRequest: (contact: any) => void;
  onSendEmailRequest: (contact: any) => void;
}

export function Contact360Modal({
  open,
  onOpenChange,
  contactId,
  onEdit,
  onDeleteRequest,
  onSendEmailRequest,
}: Contact360ModalProps) {
  const [data, setData] = useState<{ contact: any; bookings: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'notes' | 'overview'>('timeline');

  // Notes editing state
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  useEffect(() => {
    if (contactId && open) {
      setIsLoading(true);
      getContactDetails(contactId)
        .then((res) => {
          if (res.success && res.data) {
            setData(res.data);
            setNotes(res.data.contact.notes || '');
          }
        })
        .finally(() => setIsLoading(false));
      setActiveTab('timeline');
      setNotesSavedSuccess(false);
    }
  }, [contactId, open]);

  const handleSaveNotes = async () => {
    if (!data?.contact) return;
    setIsSavingNotes(true);
    try {
      await updateContact(data.contact.id, { notes });
      setNotesSavedSuccess(true);
      setTimeout(() => setNotesSavedSuccess(false), 2000);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const contact = data?.contact;
  const bookings = data?.bookings || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {isLoading ? (
          <div className="p-16 text-center text-xs font-semibold text-slate-400">
            Loading contact history...
          </div>
        ) : !contact ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Contact information could not be retrieved.
          </div>
        ) : (
          <>
            {/* Contact Profile Header */}
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <Avatar className="h-14 w-14 rounded-2xl border-2 border-white dark:border-slate-800 shadow-md">
                    <AvatarFallback className="bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-black text-lg">
                      {getInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2">
                      <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        {contact.name}
                      </DialogTitle>
                      {contact.company && (
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          &bull; {contact.company}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {contact.email}
                      </span>
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {contact.phone}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {contact.tags && contact.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {contact.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      onSendEmailRequest(contact);
                    }}
                    className="h-8 px-3 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm"
                  >
                    <Send className="w-3 h-3 mr-1.5" />
                    Message
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      onEdit(contact);
                    }}
                    className="h-8 px-3 rounded-xl text-xs font-semibold"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onOpenChange(false);
                      onDeleteRequest(contact);
                    }}
                    className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center gap-6 mt-6 border-b border-slate-200 dark:border-slate-800 -mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('timeline')}
                  className={`pb-2.5 text-xs font-bold transition-all relative ${
                    activeTab === 'timeline'
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Meeting History ({bookings.length})
                  {activeTab === 'timeline' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`pb-2.5 text-xs font-bold transition-all relative ${
                    activeTab === 'notes'
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Private Host Notes
                  {activeTab === 'notes' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2.5 text-xs font-bold transition-all relative ${
                    activeTab === 'overview'
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Contact Insights
                  {activeTab === 'overview' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
                  )}
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeTab === 'timeline' && (
                <div className="space-y-3">
                  {bookings.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                      No meetings recorded yet with this contact.
                    </div>
                  ) : (
                    bookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: b.eventType?.color || '#0069FF' }}
                            />
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {b.eventType?.title || 'Scheduled Meeting'}
                            </h4>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              b.status === 'CONFIRMED'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : b.status === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(b.startTime).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>

                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(b.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(b.endTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>

                          {b.meetingUrl && (
                            <a
                              href={b.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                            >
                              <Video className="w-3.5 h-3.5" />
                              Join Room
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>

                        {b.guestNotes && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                            <span className="font-bold text-slate-500 dark:text-slate-400 mr-1">
                              Guest Note:
                            </span>
                            {b.guestNotes}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Private Meeting Minutes & Notes
                    </label>
                    {notesSavedSuccess && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Notes saved!
                      </span>
                    )}
                  </div>

                  <Textarea
                    rows={8}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write private notes about this contact, discussion points, action items, or preferences..."
                    className="rounded-xl text-xs leading-relaxed"
                  />

                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      isLoading={isSavingNotes}
                      className="rounded-xl h-9 px-4 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white"
                    >
                      Save Notes
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Total Meetings
                    </span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {contact.totalBookings || bookings.length}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Relationship Status
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {(contact.totalBookings || bookings.length) > 1 ? 'Repeat Client' : 'Active Lead'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Last Meeting
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {contact.lastMeetingAt
                        ? new Date(contact.lastMeetingAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'No meetings yet'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Added to CRM
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {new Date(contact.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
