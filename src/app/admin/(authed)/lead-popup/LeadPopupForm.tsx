'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateLeadPopupAction, type ActionResult } from '@/lib/admin-actions/lead-popup';

type State = ActionResult | { ok: null };

export type InitialPopup = {
  isEnabled: boolean;
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
} | null;

export default function LeadPopupForm({ initial }: { initial: InitialPopup }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    updateLeadPopupAction,
    { ok: null },
  );

  useEffect(() => {
    if (state.ok === true) toast.success('Popup settings saved');
    if (state.ok === false) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <Card title="Behaviour">
        <label className="inline-flex items-center gap-2.5 text-sm text-gray-700">
          <input type="checkbox" name="isEnabled" defaultChecked={initial?.isEnabled ?? true}
                 className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-accent/40" />
          Show the popup on the homepage
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumField label="Delay before showing (seconds)" name="delaySeconds"
                    defaultValue={initial?.delaySeconds ?? 15} min={0} max={600} />
          <NumField label="Show again after (days)" name="reshowAfterDays"
                    defaultValue={initial?.reshowAfterDays ?? 7} min={0} max={365} />
        </div>
        <p className="-mt-2 text-xs text-gray-500">
          Someone who closes or submits the popup won&rsquo;t see it again for this many days.
          Set to <strong>0</strong> to show it once per browser session.
        </p>
      </Card>

      <Card title="Popup content">
        <TextField label="Heading" name="heading" required
                   defaultValue={initial?.heading ?? 'Start your journey with Sonargaon University'} />
        <TextAreaField label="Sub-heading" name="subheading" rows={2}
                       defaultValue={initial?.subheading ?? ''}
                       placeholder="Get personalized admission guidance from our admission team." />
        <TextField label="Submit button label" name="submitLabel" required
                   defaultValue={initial?.submitLabel ?? 'Get admission guidance'} />
        <TextField label="Footnote under the button" name="footnote"
                   defaultValue={initial?.footnote ?? ''}
                   placeholder="Our admission team will contact you shortly." />
      </Card>

      <Card title="Form fields">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Name label" name="nameLabel" required
                     defaultValue={initial?.nameLabel ?? 'Full name'} />
          <TextField label="Name placeholder" name="namePlaceholder" required
                     defaultValue={initial?.namePlaceholder ?? 'As written on your certificate'} />
          <TextField label="Phone label" name="phoneLabel" required
                     defaultValue={initial?.phoneLabel ?? 'Mobile number'} />
          <TextField label="Phone placeholder" name="phonePlaceholder" required
                     defaultValue={initial?.phonePlaceholder ?? '01XXXXXXXXX'} />
          <TextField label="Programme label" name="programLabel" required
                     defaultValue={initial?.programLabel ?? 'Programme you are interested in'} />
          <TextField label="Programme placeholder" name="programPlaceholder" required
                     defaultValue={initial?.programPlaceholder ?? 'Choose a programme'} />
        </div>
        <TextAreaField label="Programme options — one per line" name="programOptions" rows={4}
                       defaultValue={(initial?.programOptions ?? []).join('\n')}
                       placeholder={'B.A. in Bangla'} />
        <p className="-mt-2 text-xs text-gray-500">
          Leave empty to use the live Programs list automatically, so the dropdown stays correct
          when a programme is added or renamed.
        </p>
      </Card>

      <Card title="After submitting">
        <TextField label="Success heading" name="successHeading" required
                   defaultValue={initial?.successHeading ?? 'Thank you!'} />
        <TextAreaField label="Success message" name="successBody" rows={2}
                       defaultValue={initial?.successBody ?? ''}
                       placeholder="Our admission team will contact you shortly." />
      </Card>

      {state.ok === false && (
        <div role="alert"
             className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={pending}
                className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">{title}</h2>
      {children}
    </section>
  );
}

function TextField({
  label, name, defaultValue, required, placeholder,
}: {
  label: string; name: string; defaultValue?: string;
  required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
        {label}{required && <span aria-hidden="true" className="ml-0.5 text-red-500">*</span>}
      </label>
      <input id={name} name={name} defaultValue={defaultValue}
             required={required} placeholder={placeholder}
             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50" />
    </div>
  );
}

function NumField({
  label, name, defaultValue, min, max,
}: {
  label: string; name: string; defaultValue: number; min: number; max: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input id={name} name={name} type="number" min={min} max={max} defaultValue={defaultValue}
             className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50" />
    </div>
  );
}

function TextAreaField({
  label, name, defaultValue, rows = 3, placeholder,
}: {
  label: string; name: string; defaultValue?: string; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} rows={rows} placeholder={placeholder}
                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50" />
    </div>
  );
}
