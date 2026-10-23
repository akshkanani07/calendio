'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitRoutingForm } from '@/app/actions/routing.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Loader2, CheckCircle2, GitFork } from 'lucide-react';

interface PublicRoutingFormProps {
  form: any;
  hostName: string;
}

export function PublicRoutingForm({ form, hostName }: PublicRoutingFormProps) {
  const router = useRouter();

  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customSuccessMessage, setCustomSuccessMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await submitRoutingForm({
        formId: form.id,
        answers,
      });

      if (res.success) {
        if (res.targetUrl) {
          router.push(res.targetUrl);
        } else if (res.customMessage) {
          setCustomSuccessMessage(res.customMessage);
        }
      } else {
        setErrorMsg(res.error || 'Failed to submit form.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  if (customSuccessMessage) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-8 sm:p-12 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          Thank you!
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
          {customSuccessMessage}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {form.fields.map((field: any) => (
        <div key={field.id} className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {field.label} {field.required && <span className="text-purple-600">*</span>}
          </label>

          {/* Dropdown Select */}
          {field.type === 'select' && (
            <select
              required={field.required}
              value={answers[field.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
              className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="">Select an option...</option>
              {(field.options || []).map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}

          {/* Radio Buttons */}
          {field.type === 'radio' && (
            <div className="space-y-2">
              {(field.options || []).map((opt: string) => (
                <label
                  key={opt}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    answers[field.id] === opt
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={field.id}
                    required={field.required}
                    checked={answers[field.id] === opt}
                    onChange={() => setAnswers({ ...answers, [field.id]: opt })}
                    className="accent-purple-600"
                  />
                  <span className="text-xs font-bold">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* Text & Email Input */}
          {(field.type === 'text' || field.type === 'email') && (
            <Input
              type={field.type}
              required={field.required}
              placeholder={field.type === 'email' ? 'name@company.com' : 'Your answer...'}
              value={answers[field.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [field.id]: e.target.value })}
              className="h-12 rounded-xl text-sm"
            />
          )}
        </div>
      ))}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Matching schedule...</span>
            </>
          ) : (
            <>
              <span>Find Best Meeting Time</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
