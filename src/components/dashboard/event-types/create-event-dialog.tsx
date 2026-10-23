'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { slugify } from '@/lib/utils';
import { createEventType, updateEventType } from '@/app/actions/event-type.actions';
import {
  Video,
  Clock,
  Palette,
  Users,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  Layers,
  MapPin,
  Phone,
  Eye,
  Sliders,
  CheckCircle2,
  Loader2,
  X,
  ExternalLink,
  Calendar,
  Link as LinkIcon,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProviderMeta } from '@/lib/meeting-providers';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventToEdit?: any | null;
}

const LUXURY_COLORS = [
  { hex: '#0069FF', label: 'Calendly Blue' },
  { hex: '#6366F1', label: 'Royal Indigo' },
  { hex: '#8B5CF6', label: 'Vibrant Violet' },
  { hex: '#10B981', label: 'Emerald Green' },
  { hex: '#06B6D4', label: 'Electric Cyan' },
  { hex: '#F59E0B', label: 'Warm Amber' },
  { hex: '#EF4444', label: 'Crimson Red' },
  { hex: '#EC4899', label: 'Deep Rose' },
  { hex: '#0F172A', label: 'Midnight Slate' },
  { hex: '#14B8A6', label: 'Teal Luxe' },
];

const DURATION_PRESETS = [15, 30, 45, 60, 90];

const LOCATION_OPTIONS = [
  {
    value: 'GOOGLE_MEET',
    label: 'Google Meet',
    desc: 'Auto-generates Google Meet link on booking',
    icon: Video,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    value: 'ZOOM',
    label: 'Zoom Video',
    desc: 'Generates dedicated Zoom meeting ID & passcode',
    icon: Video,
    color: 'text-sky-500',
    bg: 'bg-sky-50 dark:bg-sky-950/50',
  },
  {
    value: 'MS_TEAMS',
    label: 'Microsoft Teams',
    desc: 'Enterprise Microsoft Teams Work/School meeting link',
    icon: Video,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950/50',
  },
  {
    value: 'MS_TEAMS_PERSONAL',
    label: 'Teams (Personal)',
    desc: 'Personal Microsoft Teams meet link for individual accounts',
    icon: Video,
    color: 'text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
  },
  {
    value: 'WEBEX',
    label: 'Cisco Webex',
    desc: 'Webex meeting room with access code and audio dial-in',
    icon: Video,
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-950/50',
  },
  {
    value: 'GOTO_MEETING',
    label: 'GoTo Meeting',
    desc: 'GoTo Meeting session link with 9-digit access code',
    icon: Video,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/50',
  },
  {
    value: 'AROUND',
    label: 'Around Video',
    desc: 'High-clarity collaborative video meeting room',
    icon: Video,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/50',
  },
  {
    value: 'WHEREBY',
    label: 'Whereby Video',
    desc: 'Instant browser video call, zero app installation required',
    icon: Video,
    color: 'text-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/50',
  },
  {
    value: 'CUSTOM',
    label: 'Custom Meeting Link',
    desc: 'Provide your own video link (Jitsi, Discord, or portal)',
    icon: LinkIcon,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/50',
  },
  {
    value: 'PHONE_CALL',
    label: 'Phone Call',
    desc: 'Direct telephone conversation with your invitee',
    icon: Phone,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  {
    value: 'IN_PERSON',
    label: 'In-Person Meeting',
    desc: 'Physical coffee shop, corporate office, or venue address',
    icon: MapPin,
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/50',
  },
];

export function CreateEventDialog({ open, onOpenChange, eventToEdit }: CreateEventDialogProps) {
  // Active Builder Tab: 'basic' | 'location' | 'questions' | 'preview'
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'questions' | 'preview'>('basic');

  // Form State
  const [title, setTitle] = useState(eventToEdit?.title || '30-Min Strategy Call');
  const [slug, setSlug] = useState(eventToEdit?.slug || '30-min-strategy-call');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [duration, setDuration] = useState<number>(eventToEdit?.duration || 30);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [color, setColor] = useState(eventToEdit?.color || '#0069FF');
  const [locationType, setLocationType] = useState(eventToEdit?.locationType || 'GOOGLE_MEET');
  const [locationUrl, setLocationUrl] = useState(eventToEdit?.locationUrl || '');
  const [schedulingType, setSchedulingType] = useState(eventToEdit?.schedulingType || 'ONE_ON_ONE');
  const [maxParticipants, setMaxParticipants] = useState<number>(eventToEdit?.maxParticipants || 1);

  // Custom Questions State
  const [customQuestions, setCustomQuestions] = useState<any[]>(
    eventToEdit?.customQuestions || [
      {
        id: 'q1',
        label: 'Please share anything that will help prepare for our meeting.',
        type: 'textarea',
        required: false,
      },
    ]
  );

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-slugify when title changes (unless user manually touched slug)
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isSlugManuallyEdited && !eventToEdit) {
      setSlug(slugify(newTitle));
    }
  };

  // Add a new question to the customQuestions array
  const handleAddQuestion = () => {
    const newId = `q_${Date.now()}`;
    setCustomQuestions([
      ...customQuestions,
      {
        id: newId,
        label: 'What is your primary goal for this call?',
        type: 'text',
        required: false,
      },
    ]);
  };

  // Update specific question field
  const handleUpdateQuestion = (id: string, field: string, value: any) => {
    setCustomQuestions(
      customQuestions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  // Remove a question
  const handleRemoveQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== id));
  };

  // Save / Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const finalDuration =
      customDuration && parseInt(customDuration, 10) > 0
        ? parseInt(customDuration, 10)
        : duration;

    const payload = {
      title: title.trim(),
      slug: slugify(slug),
      description: description.trim() || undefined,
      duration: finalDuration,
      color,
      locationType,
      locationUrl: locationUrl.trim() || undefined,
      schedulingType,
      maxParticipants: schedulingType === 'GROUP' ? maxParticipants : 1,
      customQuestions,
    };

    try {
      let res;
      if (eventToEdit) {
        res = await updateEventType(eventToEdit.id, payload);
      } else {
        res = await createEventType(payload);
      }

      if (res.success) {
        onOpenChange(false);
      } else {
        setErrorMessage(res.error || 'Failed to save event type.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        {/* ============================================================ */}
        {/* Top Header & Builder Navigation Tabs */}
        {/* ============================================================ */}
        <div className="p-6 pb-0 border-b border-slate-200/80 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2.5">
              <div
                className="h-9 w-9 rounded-2xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: color }}
              >
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {eventToEdit ? 'Edit Event Type' : 'Create New Event Type'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Configure scheduling rules, video integrations, and invitee questions.
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Builder Navigation Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-3 pt-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95',
                activeTab === 'basic'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Basic & Branding</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('location')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95',
                activeTab === 'location'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Location & Video</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95',
                activeTab === 'questions'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Invitee Questions ({customQuestions.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95',
                activeTab === 'preview'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Live Card Preview</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Scrollable Form Body */}
        {/* ============================================================ */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC & BRANDING */}
          {activeTab === 'basic' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Event Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. 30-Min Strategy Call"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="h-11 rounded-2xl font-bold text-sm"
                />
              </div>

              {/* Event Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Booking URL Slug <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 h-11 text-xs">
                  <span className="text-slate-400 font-mono select-none">
                    calendio.com/you/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setIsSlugManuallyEdited(true);
                      setSlug(slugify(e.target.value));
                    }}
                    className="flex-1 bg-transparent font-mono font-bold text-slate-900 dark:text-white outline-none pl-1"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Description & Context (Optional)
                </label>
                <Textarea
                  rows={3}
                  placeholder="A brief summary for your attendees explaining what to expect..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-2xl text-xs"
                />
              </div>

              {/* Duration Presets & Custom Duration */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Meeting Duration</span>
                  <span className="text-[11px] font-mono text-brand-600 dark:text-brand-400 font-bold">
                    {customDuration ? `${customDuration} mins` : `${duration} mins`}
                  </span>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  {DURATION_PRESETS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDuration(d);
                        setCustomDuration('');
                      }}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95',
                        duration === d && !customDuration
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500'
                      )}
                    >
                      {d}m
                    </button>
                  ))}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-xs text-slate-400">Custom:</span>
                    <Input
                      type="number"
                      min={5}
                      max={480}
                      placeholder="Mins"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      className="w-20 h-9 rounded-xl text-xs text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Color Hex Palette */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Event Theme Color
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  {LUXURY_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      className={cn(
                        'h-8 w-8 rounded-full transition-transform active:scale-90 flex items-center justify-center',
                        color === c.hex
                          ? 'ring-4 ring-brand-500/30 scale-110 shadow-sm'
                          : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {color === c.hex && (
                        <CheckCircle2 className="h-4 w-4 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCATION & VIDEO CONFERENCING */}
          {activeTab === 'location' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Conferencing & Location Type
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose how and where you will meet your invitees.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {LOCATION_OPTIONS.map((loc) => {
                  const Icon = loc.icon;
                  const isSelected = locationType === loc.value;

                  return (
                    <button
                      key={loc.value}
                      type="button"
                      onClick={() => setLocationType(loc.value)}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between',
                        isSelected
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={cn(
                            'h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center',
                            loc.color
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-brand-600" />
                        )}
                      </div>
                      <p className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {loc.label}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {loc.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Adaptive Location Configuration Fields */}
              {locationType === 'CUSTOM' && (
                <div className="pt-3 space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Custom Meeting URL / Portal <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="https://meet.jit.si/your-room or https://your-company.com/meet"
                    value={locationUrl}
                    onChange={(e) => setLocationUrl(e.target.value)}
                    className="h-11 rounded-2xl"
                  />
                  <p className="text-[11px] text-slate-400">
                    Invitees will be directed to this link when they click &quot;Join Meeting&quot;.
                  </p>
                </div>
              )}

              {locationType === 'IN_PERSON' && (
                <div className="pt-3 space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Physical Meeting Address / Venue <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. 100 Market St, Floor 4, San Francisco, CA or Blue Bottle Coffee"
                    value={locationUrl}
                    onChange={(e) => setLocationUrl(e.target.value)}
                    className="h-11 rounded-2xl"
                  />
                  <p className="text-[11px] text-slate-400">
                    A Google Maps directions link will be automatically generated in invites.
                  </p>
                </div>
              )}

              {locationType === 'PHONE_CALL' && (
                <div className="pt-3 space-y-1.5 animate-in fade-in duration-150">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Phone Call Instructions / Host Number
                  </label>
                  <Input
                    placeholder="+1 (555) 019-2834 or leave blank for Host to call Invitee"
                    value={locationUrl}
                    onChange={(e) => setLocationUrl(e.target.value)}
                    className="h-11 rounded-2xl"
                  />
                  <p className="text-[11px] text-slate-400">
                    Specify your phone number or leave blank to ask the invitee for their phone number upon booking.
                  </p>
                </div>
              )}

              {locationType === 'GOOGLE_MEET' && (
                <div className="pt-3 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Your Google Meet Link
                    </label>
                    <a
                      href="https://meet.google.com/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>+ Create Google Meet Room</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <Input
                    placeholder="https://meet.google.com/xxx-yyyy-zzz (or leave empty for Calendio Live Video)"
                    value={locationUrl}
                    onChange={(e) => setLocationUrl(e.target.value)}
                    className="h-11 rounded-2xl font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Paste your permanent Google Meet link. If left blank, Calendio will automatically provide a live, functional WebRTC video room so meetings never fail with &quot;Invalid Code&quot;.
                  </p>
                </div>
              )}

              {locationType === 'ZOOM' && (
                <div className="pt-3 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Your Zoom Personal Meeting Link (PMI)
                    </label>
                    <a
                      href="https://zoom.us/profile"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>+ Open Zoom Profile to copy PMI</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <Input
                    placeholder="https://zoom.us/j/1234567890 or https://zoom.us/my/yourname"
                    value={locationUrl}
                    onChange={(e) => setLocationUrl(e.target.value)}
                    className="h-11 rounded-2xl font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Paste your Zoom Personal Meeting URL. If left blank, Calendio automatically connects to a live video room so attendees never see &quot;Invalid Meeting ID (3,001)&quot;.
                  </p>
                </div>
              )}

              {(locationType === 'MS_TEAMS' || locationType === 'MS_TEAMS_PERSONAL' || locationType === 'WEBEX' || locationType === 'GOTO_MEETING' || locationType === 'AROUND' || locationType === 'WHEREBY') && (
                <div className="pt-3 space-y-2 animate-in fade-in duration-150">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {locationType.replace(/_/g, ' ')} Room Link (Optional)
                  </label>
                  <Input
                    placeholder={`https://${locationType.toLowerCase().replace(/_/g, '')}.com/your-room (optional)`}
                    value={locationUrl}
                    onChange={(e) => setLocationUrl(e.target.value)}
                    className="h-11 rounded-2xl font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-400">
                    Paste your meeting room link or leave blank to use Calendio&apos;s live cloud room.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INVITEE QUESTIONS BUILDER */}
          {activeTab === 'questions' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Custom Booking Questions
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Collect valuable details from attendees prior to the meeting.
                  </p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddQuestion}
                  className="rounded-xl text-xs font-semibold h-9"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Question
                </Button>
              </div>

              {/* Questions List */}
              <div className="space-y-3 pt-2">
                {customQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Question #{idx + 1}
                      </span>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Switch
                            checked={q.required}
                            onCheckedChange={(checked) =>
                              handleUpdateQuestion(q.id, 'required', checked)
                            }
                          />
                          <span className="text-xs font-semibold text-slate-500">
                            Required
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(q.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete question"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-8">
                        <Input
                          placeholder="e.g. What is your team size or project budget?"
                          value={q.label}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, 'label', e.target.value)
                          }
                          className="h-10 rounded-xl text-xs"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <select
                          value={q.type || 'text'}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, 'type', e.target.value)
                          }
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold outline-none"
                        >
                          <option value="text">Single Line Text</option>
                          <option value="textarea">Multi-line Paragraph</option>
                          <option value="phone">Phone Number</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LIVE CARD PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4 animate-in fade-in duration-150 max-w-md mx-auto py-4">
              <div className="text-center space-y-1 pb-2">
                <Badge variant="outline" className="text-[10px] font-mono">
                  Live Preview
                </Badge>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  This is how your event card appears to attendees
                </h3>
              </div>

              {/* Preview Card */}
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                <div className="h-2 w-full" style={{ backgroundColor: color }} />

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      Active
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      /{slug || 'slug'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-xl text-slate-900 dark:text-white leading-tight">
                      {title || 'Untitled Event'}
                    </h4>
                    {description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                        {description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="secondary" className="text-xs font-bold px-2.5 py-1 rounded-xl">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {customDuration || duration} mins
                    </Badge>

                    <Badge variant="secondary" className="text-xs font-bold px-2.5 py-1 rounded-xl">
                      {locationType === 'PHONE_CALL' ? (
                        <Phone className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                      ) : locationType === 'IN_PERSON' ? (
                        <MapPin className="w-3.5 h-3.5 mr-1 text-orange-500" />
                      ) : (
                        <Video className="w-3.5 h-3.5 mr-1 text-brand-500" />
                      )}
                      {getProviderMeta(locationType).name}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-600 flex items-center gap-1">
                      <span>Preview page</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>

                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
                    >
                      Copy link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submission Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}
        </form>

        {/* ============================================================ */}
        {/* Modal Footer with Actions */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-6 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-2xl text-xs font-semibold h-11 px-4"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {activeTab !== 'preview' ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (activeTab === 'basic') setActiveTab('location');
                  else if (activeTab === 'location') setActiveTab('questions');
                  else if (activeTab === 'questions') setActiveTab('preview');
                }}
                className="rounded-2xl text-xs font-bold h-11 px-5"
              >
                Next Step
              </Button>
            ) : null}

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-2xl text-xs font-bold h-11 px-6 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-md shadow-brand-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{eventToEdit ? 'Save Changes' : 'Create Event Type'}</span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
