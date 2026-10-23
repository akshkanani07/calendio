'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { updateProfileSettings } from '@/app/actions/settings.actions';
import {
  User,
  Mail,
  Globe,
  Clock,
  Building2,
  Phone,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileTabProps {
  initialData: {
    name: string;
    email: string;
    username: string;
    timeZone: string;
    bio: string;
    company: string;
    phone: string;
    avatarUrl: string;
  };
}

const COMMON_TIMEZONES = [
  'Asia/Kolkata',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC',
];

export function ProfileTab({ initialData }: ProfileTabProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData.name);
  const [username, setUsername] = useState(initialData.username);
  const [timeZone, setTimeZone] = useState(initialData.timeZone || 'Asia/Kolkata');
  const [bio, setBio] = useState(initialData.bio);
  const [company, setCompany] = useState(initialData.company);
  const [phone, setPhone] = useState(initialData.phone);
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl);

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const publicLink = typeof window !== 'undefined'
    ? `${window.location.origin}/${username}`
    : `/${username}`;

  const copyBookingLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await updateProfileSettings({
        name,
        username,
        timeZone,
        bio,
        company,
        phone,
        avatarUrl,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      } else {
        setError(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Error saving changes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Profile settings saved successfully!
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Avatar & Public Link Banner */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-inner">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-brand-600 text-white font-extrabold text-xl">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>

          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              {name || 'Calendio Host'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                /{username}
              </span>
              <a
                href={`/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-0.5"
              >
                View
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyBookingLink}
          className="h-9 px-3.5 rounded-xl text-xs font-semibold self-start sm:self-center"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1" />
              Copy Booking Link
            </>
          )}
        </Button>
      </div>

      {/* Profile Details Fields */}
      <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Personal Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Display Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              required
              className="rounded-xl h-10 text-xs font-medium"
            />
          </div>

          {/* Email (Read only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Verified</span>
            </label>
            <Input
              value={initialData.email}
              disabled
              className="rounded-xl h-10 text-xs bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Username / Custom Booking URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              Custom Booking URL Slug *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 select-none">
                calendio.com/
              </span>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="username"
                required
                className="pl-24 rounded-xl h-10 text-xs font-mono font-medium"
              />
            </div>
          </div>

          {/* Time Zone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Default Time Zone *
            </label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Company */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Company / Brand
            </label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Studio"
              className="rounded-xl h-10 text-xs"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              Phone Number
            </label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="rounded-xl h-10 text-xs"
            />
          </div>
        </div>

        {/* Avatar Image URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Profile Photo Image URL
          </label>
          <Input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="rounded-xl h-10 text-xs font-mono"
          />
        </div>

        {/* Bio / Welcome Message */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Welcome Message & Bio
          </label>
          <Textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Welcome to my scheduling page! Please select a convenient time for our discussion."
            className="rounded-xl text-xs leading-relaxed"
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isLoading}
          className="rounded-xl h-10 px-6 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20"
        >
          Save Profile Changes
        </Button>
      </div>
    </form>
  );
}
