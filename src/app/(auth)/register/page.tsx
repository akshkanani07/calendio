'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ArrowRight, Lock, Mail, User, CheckCircle2, KeyRound, RefreshCw, ArrowLeft, Users } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { initiateRegisterWithOtp, verifyRegisterOtpAndCreateUser, resendRegisterOtp } from '@/app/actions/auth.actions';
import { acceptTeamInvitation } from '@/app/actions/team.actions';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryEmail = searchParams.get('email') || '';
  const inviteToken = searchParams.get('inviteToken') || '';

  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(queryEmail);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Submit Details & Trigger OTP to Email
  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

    try {
      const res = await initiateRegisterWithOtp({ name, email, password, timeZone });

      if (!res.success) {
        setError(res.error || 'Failed to send verification code.');
        setIsLoading(false);
        return;
      }

      setStep('otp');
      setSuccessMsg(`A 6-digit verification code has been sent to ${email}`);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP & Activate Account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await verifyRegisterOtpAndCreateUser(email, otp);

      if (!res.success) {
        setError(res.error || 'Invalid verification code.');
        setIsLoading(false);
        return;
      }

      // Automatically sign in the newly verified user
      const loginRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (loginRes?.error) {
        router.push('/login');
      } else {
        if (inviteToken) {
          try {
            await acceptTeamInvitation(inviteToken);
          } catch {}
          router.push('/teams');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch {
      setError('Error verifying code. Please try again.');
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await resendRegisterOtp(email);
      if (!res.success) {
        setError(res.error || 'Failed to resend code.');
      } else {
        setSuccessMsg('A new verification code has been sent to your email.');
      }
    } catch {
      setError('Error resending verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[440px] shadow-xl border-slate-200/80 dark:border-slate-800">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 flex items-center justify-center">
          {step === 'form' ? (
            inviteToken ? <Users className="h-6 w-6 text-indigo-600" /> : <User className="h-6 w-6" />
          ) : (
            <KeyRound className="h-6 w-6" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
          {step === 'form'
            ? inviteToken
              ? 'Join Your Team'
              : 'Start for 100% Free'
            : 'Verify your email'}
        </CardTitle>
        <CardDescription className="text-slate-500 text-sm">
          {step === 'form'
            ? inviteToken
              ? 'Create your free account to accept the team invitation.'
              : 'Smart scheduling for everyone. No credit card required.'
            : `We sent a 6-digit code to ${email}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 text-sm rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'form' ? (
          <>
            {/* Google One-Click Signup */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-medium text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl"
              onClick={() =>
                signIn('google', {
                  callbackUrl: inviteToken ? `/teams/invite/${inviteToken}` : '/dashboard',
                })
              }
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign up with Google
            </Button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-white dark:bg-card px-3 text-xs uppercase tracking-wider text-slate-400 font-semibold absolute">
                Or with email
              </span>
            </div>

            <form onSubmit={handleInitiateSignup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Your Name"
                    className="pl-10 h-11"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    className="pl-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="rounded-xl bg-brand-50/70 dark:bg-brand-950/40 p-3 text-xs text-brand-900 dark:text-brand-200 flex items-start gap-2 border border-brand-200/60 dark:border-brand-900/40">
                <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                <span>Full access included forever: Unlimited event types, custom branding & team scheduling.</span>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-md shadow-brand-500/20"
                isLoading={isLoading}
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enter 6-Digit Verification Code
              </label>
              <div className="relative">
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="••••••"
                  className="h-13 text-center text-2xl font-extrabold tracking-[10px] text-brand-600 dark:text-brand-400 placeholder:tracking-normal placeholder:text-slate-300 rounded-xl"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-400 text-center pt-1">
                Check your inbox for the code sent from <strong>support@calendio.com</strong>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-md shadow-brand-500/20"
              isLoading={isLoading}
              disabled={otp.length !== 6}
            >
              Verify & Launch Calendio <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Change details
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Resend Code
              </button>
            </div>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs text-slate-500">
        <span>Already have an account?</span>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="font-semibold text-brand-500 hover:text-brand-600"
          >
            Log in
          </Link>
          <span>•</span>
          <Link
            href="/forgot-password"
            className="font-semibold text-slate-600 dark:text-slate-400 hover:text-brand-500"
          >
            Forgot password?
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 font-sans">
      <div className="mb-8"><Logo size="lg" href="/" /></div>

      <Suspense fallback={<div className="text-xs text-slate-400">Loading form...</div>}>
        <RegisterFormContent />
      </Suspense>
    </div>
  );
}
