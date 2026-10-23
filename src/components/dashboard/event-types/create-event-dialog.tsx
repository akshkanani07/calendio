'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventToEdit?: any | null;
}

const colors = [
  '#0069FF', // Calendly Blue
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#06B6D4', // Cyan
];

const durations = [15, 30, 45, 60];

const locations = [
  { value: 'GOOGLE_MEET', label: 'Google Meet', icon: '📹' },
  { value: 'ZOOM', label: 'Zoom Video', icon: '🎥' },
  { value: 'MS_TEAMS', label: 'Microsoft Teams', icon: '💻' },
  { value: 'PHONE_CALL', label: 'Phone Call', icon: '📞' },
  { value: 'IN_PERSON', label: 'In-Person Meeting', icon: '📍' },
];

export function CreateEventDialog({ open, onOpenChange, eventToEdit }: CreateEventDialogProps) {
  const [title, setTitle] = useState(eventToEdit?.title || 'Quick Discussion');
  const [slug, setSlug] = useState(eventToEdit?.slug || 'quick-discussion');
  const [description, setDescription] = useState(eventToEdit?.description || '');
  const [duration, setDuration] = useState<number>(eventToEdit?.duration || 30);
  const [color, setColor] = useState(eventToEdit?.color || '#0069FF');
  const [locationType, setLocationType] = useState(eventToEdit?.locationType || 'GOOGLE_MEET');
  const [locationUrl, setLocationUrl] = useState(eventToEdit?.locationUrl || '');
  const [schedulingType, setSchedulingType] = useState(eventToEdit?.schedulingType || 'ONE_ON_ONE');
  const [maxParticipants, setMaxParticipants] = useState<number>(eventToEdit?.maxParticipants || 1);
  const [customQuestions, setCustomQuestions] = useState<any[]>(
    eventToEdit?.customQuestions || [
      { id: '1', label: 'Please share anything that will help prepare for our meeting.', type: 'textarea', required: false },
    ]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!eventToEdit) {
      setSlug(slugify(val));
    }
  };

  const handleAddQuestion = () => {
    setCustomQuestions([
      ...customQuestions,
      {
        id: Date.now().toString(),
        label: 'Additional Information',
        type: 'text',
        required: false,
      },
    ]);
  };

  const handleRemoveQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter((q) => q.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      title,
      slug: slugify(slug),
      description,
      duration,
      color,
      schedulingType,
      locationType,
      locationUrl: locationType === 'IN_PERSON' || locationType === 'CUSTOM' ? locationUrl : undefined,
      maxParticipants: schedulingType === 'GROUP' ? maxParticipants : 1,
      customQuestions,
    };

    try {
      const res = eventToEdit
        ? await updateEventType(eventToEdit.id, payload)
        : await createEventType(payload);

      if (!res.success) {
        setError(res.error || 'Failed to save event type.');
      } else {
        onOpenChange(false);
      }
    } catch {
      setError('An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            {eventToEdit ? 'Edit Event Type' : 'Create New Event Type'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Define your meeting parameters, location, and guest questions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-sm">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Event Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Event Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="30 Minute Discovery Call"
                  className="rounded-xl h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Booking Link Slug *
                </label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="30-min-discovery"
                  className="rounded-xl h-10 font-mono text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description / Instructions
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly explain what this meeting is about..."
                className="rounded-xl min-h-[70px] text-xs"
              />
            </div>
          </div>

          {/* Section 2: Duration & Scheduling Type */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Duration & Format
            </h4>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Duration
              </label>
              <div className="flex flex-wrap gap-2">
                {durations.map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDuration(d)}
                    className={
                      'px-4 py-2 rounded-xl text-xs font-bold border transition-all ' +
                      (duration === d
                        ? 'bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-brand-500 text-slate-600 dark:text-slate-300')
                    }
                  >
                    {d} mins
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSchedulingType('ONE_ON_ONE')}
                className={
                  'p-3.5 rounded-xl border text-left transition-all ' +
                  (schedulingType === 'ONE_ON_ONE'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-800')
                }
              >
                <p className="font-bold text-xs text-slate-900 dark:text-white">One-on-One</p>
                <p className="text-[11px] text-slate-500 mt-0.5">1 host with 1 guest</p>
              </button>

              <button
                type="button"
                onClick={() => setSchedulingType('GROUP')}
                className={
                  'p-3.5 rounded-xl border text-left transition-all ' +
                  (schedulingType === 'GROUP'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 ring-1 ring-brand-500'
                    : 'border-slate-200 dark:border-slate-800')
                }
              >
                <p className="font-bold text-xs text-slate-900 dark:text-white">Group / Webinar</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Multiple guests per time slot</p>
              </button>
            </div>

            {schedulingType === 'GROUP' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Maximum Guests per Slot
                </label>
                <Input
                  type="number"
                  min={2}
                  max={100}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 10)}
                  className="w-32 rounded-xl h-10"
                />
              </div>
            )}
          </div>

          {/* Section 3: Location */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Meeting Location
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {locations.map((loc) => (
                <button
                  type="button"
                  key={loc.value}
                  onClick={() => setLocationType(loc.value)}
                  className={
                    'p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ' +
                    (locationType === loc.value
                      ? 'border-brand-500 bg-brand-50/70 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300 ring-1 ring-brand-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300')
                  }
                >
                  <span className="text-xl">{loc.icon}</span>
                  <span className="text-xs font-semibold">{loc.label}</span>
                </button>
              ))}
            </div>

            {(locationType === 'IN_PERSON' || locationType === 'CUSTOM') && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Address or Meeting Link
                </label>
                <Input
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  placeholder="e.g. Office Suite 402, or custom URL"
                  className="rounded-xl h-10"
                />
              </div>
            )}
          </div>

          {/* Section 4: Brand Color */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              4. Event Color
            </h4>
            <div className="flex items-center gap-3">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={
                    'h-7 w-7 rounded-full transition-all ' +
                    (color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900 shadow-md' : 'hover:scale-110')
                  }
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Section 5: Custom Questions */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                5. Invitee Questions
              </h4>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Question
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500">
              ✓ Name & Email Address are included by default.
            </div>

            {customQuestions.map((q, idx) => (
              <div key={q.id || idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <Input
                    value={q.label}
                    onChange={(e) => {
                      const updated = [...customQuestions];
                      updated[idx].label = e.target.value;
                      setCustomQuestions(updated);
                    }}
                    placeholder="Question label..."
                    className="h-8 text-xs font-semibold rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <select
                      value={q.type}
                      onChange={(e) => {
                        const updated = [...customQuestions];
                        updated[idx].type = e.target.value;
                        setCustomQuestions(updated);
                      }}
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-xs"
                    >
                      <option value="text">Single Line Text</option>
                      <option value="textarea">Multi-Line Textarea</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Required:</span>
                    <Switch
                      checked={q.required}
                      onCheckedChange={(checked) => {
                        const updated = [...customQuestions];
                        updated[idx].required = checked;
                        setCustomQuestions(updated);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-10 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20"
              isLoading={isLoading}
            >
              {eventToEdit ? 'Save Changes' : 'Create Event Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
