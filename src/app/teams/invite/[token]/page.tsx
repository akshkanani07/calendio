import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AcceptInviteForm } from './accept-invite-form';

export default async function AcceptTeamInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getServerSession(authOptions);

  let invitation: any = null;
  try {
    const rows = await db.$queryRawUnsafe<any[]>(
      'SELECT * FROM "TeamInvitation" WHERE "token" = $1 LIMIT 1',
      token
    );
    if (rows && rows.length > 0) {
      invitation = rows[0];
      const team = await db.team.findUnique({
        where: { id: invitation.teamId },
        include: {
          owner: {
            include: { profile: true },
          },
        },
      });
      invitation.team = team;
    }
  } catch (err) {
    console.error('Fetch Invite Error:', err);
    invitation = null;
  }

  const isExpired = invitation && new Date(invitation.expiresAt) < new Date();
  const isInvalid = !invitation || invitation.status !== 'PENDING' || isExpired || !invitation.team;

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto w-full">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-black text-indigo-600 tracking-tight">Calendio</span>
          </Link>
        </div>

        {isInvalid ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
              Invitation Invalid or Expired
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              This team invitation link is no longer valid or has expired. Please contact the team administrator to request a new invitation.
            </p>
            <Link href="/login">
              <Button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-11">
                Go to Calendio
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full">
              Team Invitation
            </span>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3 mb-2">
              Join {invitation.team.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              <strong className="text-slate-700 dark:text-slate-200">
                {invitation.team.owner?.name || 'Team Owner'}
              </strong>{' '}
              has invited you to collaborate as a{' '}
              <strong className="text-indigo-600">{invitation.role}</strong> on Calendio.
            </p>

            {/* Accept / Register Actions */}
            <AcceptInviteForm
              token={token}
              email={invitation.email}
              isLoggedIn={Boolean(session?.user?.email)}
              teamSlug={invitation.team.slug}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-400 dark:text-slate-500">
        <p>
          Powered by{' '}
          <Link href="/" className="font-bold text-indigo-600 hover:underline">
            Calendio
          </Link>{' '}
          • 100% Free Smart Scheduling
        </p>
      </footer>
    </div>
  );
}
