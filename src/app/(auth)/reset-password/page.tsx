'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { resetPasswordWithToken } from '@/app/actions/auth.actions';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPasswordWithToken(token, password);
      if (!res.success) {
        setError(res.error || 'Failed to reset password.');
      } else {
        setIsSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[430px] shadow-xl border-slate-200/80 dark:border-slate-800">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-500 flex items-center justify-center">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
          {isSuccess ? 'Password Reset!' : 'Set new password'}
        </CardTitle>
        <CardDescription className="text-slate-500 text-sm">
          {isSuccess
            ? 'Your password has been securely updated.'
            : 'Must be at least 6 characters long.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
            {error}
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-6 text-center py-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              You can now log in to your Calendio account using your new password.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full h-11 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-md shadow-brand-500/20"
            >
              Sign In Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                New Password
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="Repeat new password"
                  className="pl-10 h-11"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Validation Hints */}
            <div className="space-y-1 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <span className={password.length >= 6 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}>
                  {password.length >= 6 ? '✓' : '•'} At least 6 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={
                    password && password === confirmPassword
                      ? 'text-emerald-600 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  {password && password === confirmPassword ? '✓' : '•'} Passwords match
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl shadow-md shadow-brand-500/20"
              isLoading={isLoading}
            >
              Update Password <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-slate-100 dark:border-slate-800/80 pt-4 text-sm text-slate-500">
        <Link
          href="/login"
          className="font-semibold text-brand-500 hover:text-brand-600"
        >
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 font-sans">
      <div className="mb-8"><Logo size="lg" href="/" /></div>
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
