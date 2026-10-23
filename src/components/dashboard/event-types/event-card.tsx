'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Copy,
  Check,
  ExternalLink,
  MoreVertical,
  Clock,
  Video,
  Users,
  Pencil,
  CopyPlus,
  Trash2,
  Phone,
  MapPin,
} from 'lucide-react';
import { getProviderMeta } from '@/lib/meeting-providers';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { toggleEventTypeStatus, duplicateEventType, deleteEventType } from '@/app/actions/event-type.actions';
import { CreateEventDialog } from './create-event-dialog';

interface EventCardProps {
  event: any;
  username: string;
}

export function EventCard({ event, username }: EventCardProps) {
  const [isActive, setIsActive] = useState(event.isActive);
  const [copied, setCopied] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const cleanUsername = username || 'me';

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/${cleanUsername}/${event.slug}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async (checked: boolean) => {
    setIsActive(checked);
    await toggleEventTypeStatus(event.id, checked);
  };

  const handleDuplicate = async () => {
    setIsPending(true);
    await duplicateEventType(event.id);
    setIsPending(false);
  };

  const handleDeleteConfirm = async () => {
    await deleteEventType(event.id);
  };

  return (
    <>
      <Card className={'relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ' +
        (isActive
          ? 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'
          : 'border-slate-200/50 dark:border-slate-800/50 bg-slate-50/60 dark:bg-slate-950/40 opacity-75')}>
        {/* Top Colored Accent Stripe */}
        <div className="h-1.5 w-full" style={{ backgroundColor: event.color || '#0069FF' }} />

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            {/* Header: Status Switch & Kebab Menu */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={handleToggle}
                  title={isActive ? 'Active (Click to turn off)' : 'Inactive (Click to turn on)'}
                />
                <span className="text-[11px] font-semibold text-slate-400">
                  {isActive ? 'Active' : 'Off'}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 p-1 rounded-xl shadow-xl border-slate-200 dark:border-slate-800">
                  <DropdownMenuItem
                    onClick={() => setIsEditDialogOpen(true)}
                    className="cursor-pointer text-xs font-semibold rounded-lg flex items-center gap-2"
                  >
                    <Pencil className="h-3.5 w-3.5 text-slate-500" />
                    <span>Edit</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleDuplicate}
                    disabled={isPending}
                    className="cursor-pointer text-xs font-semibold rounded-lg flex items-center gap-2"
                  >
                    <CopyPlus className="h-3.5 w-3.5 text-slate-500" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="cursor-pointer text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Event Title */}
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
              {event.title}
            </h3>

            {/* Duration & Format Meta */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{event.duration} mins</span>
              </Badge>

              <Badge variant="outline" className="text-[11px] font-medium px-2 py-0.5 rounded-md text-slate-500">
                {event.schedulingType === 'GROUP' ? 'Group Event' : '1-on-1'}
              </Badge>

              {(() => {
                const meta = getProviderMeta(event.locationType || 'GOOGLE_MEET');
                const IconComp = meta.category === 'phone' ? Phone : meta.category === 'in_person' ? MapPin : Video;
                return (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                    <IconComp className="h-3.5 w-3.5 text-slate-400" />
                    <span>{meta.name}</span>
                  </span>
                );
              })()}
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Bottom Card Footer Actions */}
          <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <Link
              href={`/${cleanUsername}/${event.slug}`}
              target="_blank"
              className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View booking page</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-600 dark:text-slate-300 font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Card>

      {/* Edit Event Dialog Modal */}
      {isEditDialogOpen && (
        <CreateEventDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          eventToEdit={event}
        />
      )}

      {/* Custom Calendio Delete Confirmation Modal */}
      <ConfirmModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Event Type"
        description={`Are you sure you want to delete "${event.title}"? This action cannot be undone and will permanently remove this booking link.`}
        confirmText="Delete Event"
        cancelText="Keep Event"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
