'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { acceptTeamInvitation } from '@/app/actions/team.actions';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';

interface AcceptInviteFormProps {
  token: string;
  email: string;
  isLoggedIn: boolean;
  teamSlug: string;
}

export function AcceptInviteForm({
  token,
  email,
  isLoggedIn,
  teamSlug,
}: AcceptInviteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAccept = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await acceptTeamInvitation(token);

      if (res.success) {
        router.push(`/teams/${res.teamSlug || teamSlug}`);
      } else {
        setErrorMsg(res.error || 'Failed to accept invitation.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="space-y-3 pt-2">
        <Link
          href={`/register?email=${encodeURIComponent(email)}&inviteToken=${token}`}
          className="block"
        >
          <Button className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Create Free Account to Accept</span>
          </Button>
        </Link>

        <Link
          href={`/login?callbackUrl=/teams/invite/${token}`}
          className="block"
        >
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-xl text-xs font-bold"
          >
            <LogIn className="h-4 w-4 mr-2" />
            <span>Already have an account? Sign in</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-2">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-semibold">
          {errorMsg}
        </div>
      )}

      <Button
        onClick={handleAccept}
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Joining Team...</span>
          </>
        ) : (
          <>
            <span>Accept Invitation & Join Team</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}
