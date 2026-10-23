'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, KeyRound, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { sendPasswordResetOtp, verifyPasswordResetOtp } from '@/app/actions/auth.actions';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await sendPasswordResetOtp(email);
      if (!res.success) {
        setError(res.error || 'Failed to send verification code.');
      } else {
        setResetToken(res.token || null);
        setStep('otp');
        setSuccessMsg('A 6-digit verification code has been sent to your email.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await verifyPasswordResetOtp(email, otp);
      if (!res.success) {
        setError(res.error || 'Invalid verification code.');
      } else {
        // Redirect to reset password with the verified token
        const tokenToUse = res.resetToken || resetToken;
        router.push(`/reset-password?token=${tokenToUse}`);
      }
    } catch {
      setError('Error verifying code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 font-sans">
      {/* Brand Header */}
      <div className="mb-8"><Logo size="lg" href="/" /></div>

      <Card className="w-full max-w-[430px] shadow-xl border-slate-200/80 dark:border-slate-800">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 flex items-center justify-center">
            {step === 'email' ? <Mail className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {step === 'email' ? 'Forgot password?' : 'Enter 6-digit code'}
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            {step === 'email'
              ? 'No worries! Enter your email and we will send you an OTP.'
              : `We sent a verification code to ${email}`}
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

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full h-11 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-md shadow-brand-500/20"
                isLoading={isLoading}
              >
                Send Verification Code <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  6-Digit OTP Code
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="••••••"
                    className="h-13 text-center text-2xl font-extrabold tracking-[10px] text-brand-600 dark:text-brand-400 placeholder:tracking-normal placeholder:text-slate-300"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-md shadow-brand-500/20"
                isLoading={isLoading}
                disabled={otp.length !== 6}
              >
                Verify & Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Change email
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="text-brand-500 hover:text-brand-600 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Resend Code
                </button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800/80 pt-4 text-sm text-slate-500">
          Remember your password?{' '}
          <Link
            href="/login"
            className="ml-1.5 font-semibold text-brand-500 hover:text-brand-600"
          >
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
