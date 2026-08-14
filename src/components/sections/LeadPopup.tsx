'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

export type LeadPopupConfig = {
  delaySeconds: number;
  reshowAfterDays: number;
  heading: string;
  subheading: string | null;
  nameLabel: string;
  namePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  programLabel: string;
  programPlaceholder: string;
  programOptions: string[];
  submitLabel: string;
  footnote: string | null;
  successHeading: string;
  successBody: string | null;
};

// Remembering the dismissal in localStorage (not a cookie) keeps this
// client-only — no extra request, and nothing to consent to.
const STORAGE_KEY = 'su-lead-popup-dismissed-at';

function recentlyDismissed(reshowAfterDays: number): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    // 0 days = once per session; sessionStorage clears on tab close.
    if (reshowAfterDays === 0) return window.sessionStorage.getItem(STORAGE_KEY) === '1';
    const then = Number(raw);
    if (!Number.isFinite(then)) return false;
    return Date.now() - then < reshowAfterDays * 86_400_000;
  } catch {
    // Private browsing can throw on storage access — fail open rather
    // than suppressing the popup entirely.
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    window.sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* storage unavailable — popup will simply show again */
  }
}

export default function LeadPopup({ config }: { config: LeadPopupConfig }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // Fire once, `delaySeconds` after mount.
  useEffect(() => {
    if (recentlyDismissed(config.reshowAfterDays)) return;
    const t = window.setTimeout(() => setOpen(true), config.delaySeconds * 1000);
    return () => window.clearTimeout(t);
  }, [config.delaySeconds, config.reshowAfterDays]);

  // Lock body scroll and move focus into the dialog while it's open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    rememberDismissal();
    setOpen(false);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fd.get('fullName'),
          phone: fd.get('phone'),
          programme: fd.get('programme'),
          website: fd.get('website'),
          sourcePath: window.location.pathname,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Something went wrong. Please try again.');
        return;
      }
      rememberDismissal();
      setDone(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-popup-heading"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
      />

      <div
        ref={dialogRef}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Brand gradient hairline along the top edge. */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary" />

        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-5 inline-flex size-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
        >
          <X size={16} />
        </button>

        <div className="p-7 md:p-8">
          {done ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 inline-flex size-14 items-center justify-center rounded-full bg-green-50 text-green-600">
                <CheckCircle2 size={30} strokeWidth={1.75} />
              </div>
              <h2 className="font-display text-xl font-bold text-primary">
                {config.successHeading}
              </h2>
              {config.successBody && (
                <p className="mt-2 text-[14px] leading-relaxed text-gray-600">
                  {config.successBody}
                </p>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-[14px] font-bold text-white transition-colors hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2
                id="lead-popup-heading"
                className="pr-8 font-display text-[22px] font-bold leading-snug text-primary md:text-2xl"
              >
                {config.heading}
              </h2>
              {config.subheading && (
                <p className="mt-2 text-[14px] leading-relaxed text-gray-600">
                  {config.subheading}
                </p>
              )}

              <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
                {/* Honeypot — visually hidden, never focusable. */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] size-0 opacity-0"
                />

                <Field label={config.nameLabel} htmlFor="lead-name">
                  <input
                    ref={firstFieldRef}
                    id="lead-name"
                    name="fullName"
                    required
                    autoComplete="name"
                    placeholder={config.namePlaceholder}
                    className="w-full rounded-lg bg-gray-100 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </Field>

                <Field label={config.phoneLabel} htmlFor="lead-phone">
                  <input
                    id="lead-phone"
                    name="phone"
                    required
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder={config.phonePlaceholder}
                    className="w-full rounded-lg bg-gray-100 px-4 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                </Field>

                <Field label={config.programLabel} htmlFor="lead-programme">
                  <select
                    id="lead-programme"
                    name="programme"
                    required
                    defaultValue=""
                    className="w-full appearance-none rounded-lg bg-gray-100 px-4 py-3 text-[14px] text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
                  >
                    <option value="" disabled>
                      {config.programPlaceholder}
                    </option>
                    {config.programOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>

                {error && (
                  <p role="alert" className="text-[13px] font-medium text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-6 py-3.5 text-[15px] font-bold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      {config.submitLabel}
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

                {config.footnote && (
                  <p className="text-center text-[12px] text-gray-500">{config.footnote}</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-bold text-primary">
        {label} <span className="text-accent">*</span>
      </label>
      {children}
    </div>
  );
}
