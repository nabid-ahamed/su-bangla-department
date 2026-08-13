'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Program } from '@prisma/client';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  createProgramAction,
  updateProgramAction,
  type ActionResult,
} from '@/lib/admin-actions/programs';

type State = ActionResult | { ok: null };

export default function ProgramForm({ initial }: { initial: Program | null }) {
  const isEdit = !!initial;
  const action = isEdit
    ? updateProgramAction.bind(null, initial!.id)
    : createProgramAction;

  const [state, formAction, pending] = useActionState<State, FormData>(
    action,
    { ok: null },
  );

  useEffect(() => {
    if (state.ok === true) toast.success(isEdit ? 'Program saved' : 'Program created');
    if (state.ok === false) toast.error(state.error);
  }, [state, isEdit]);

  return (
    <form action={formAction} className="space-y-6">
      <Card title="Details">
        <TextField label="Program name" name="programName" required
                   defaultValue={initial?.programName ?? ''} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Degree code" name="degreeCode" required
                     defaultValue={initial?.degreeCode ?? ''} />
          <TextField label="Duration" name="duration" required
                     defaultValue={initial?.duration ?? ''}
                     placeholder="4 Years · 8 Semesters" />
        </div>
        <TextAreaField label="Description" name="description" required rows={4}
                       defaultValue={initial?.description ?? ''} />
        <TextAreaField label="Specializations (one per line, optional)"
                       name="specializations" rows={4}
                       defaultValue={(initial?.specializations ?? []).join('\n')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="CTA text (optional)" name="cta"
                     defaultValue={initial?.cta ?? ''}
                     placeholder="e.g. View More" />
          <TextField label="CTA href (optional)" name="ctaHref"
                     defaultValue={initial?.ctaHref ?? ''}
                     placeholder="/admission/requirements" />
        </div>
        <p className="text-xs text-gray-500 -mt-2">
          CTA href: leave blank to send &ldquo;View More&rdquo; to this program&rsquo;s detail page
          (set the URL slug below), or to{' '}
          <code className="font-mono">/admission/requirements</code> when there is no slug.
        </p>
      </Card>

      <Card title="Detail page">
        <TextField label="URL slug (optional)" name="slug"
                   defaultValue={initial?.slug ?? ''}
                   placeholder="ba-in-bangla" />
        <p className="text-xs text-gray-500 -mt-2">
          Publishes the program at <code className="font-mono">/programs/&lt;slug&gt;</code>. Leave
          blank for no detail page. Lowercase letters, numbers and hyphens.
        </p>
        <TextAreaField label="Overview (optional)" name="overview" rows={7}
                       defaultValue={initial?.overview ?? ''}
                       placeholder="Long-form intro for the detail page. Leave a blank line between paragraphs." />
        <p className="text-xs text-gray-500 -mt-2">
          Falls back to the short Description above when blank. Separate paragraphs with a blank line.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TextField label="Total credits" name="totalCredits"
                     defaultValue={initial?.totalCredits ?? ''} placeholder="142" />
          <TextField label="Semester format label" name="semesterFormatLabel"
                     defaultValue={initial?.semesterFormatLabel ?? ''} placeholder="Bi-Semester" />
          <TextField label="Semester format" name="semesterFormat"
                     defaultValue={initial?.semesterFormat ?? ''} placeholder="Six Months Semester" />
        </div>
        <TextField label="Degree awarded" name="degreeAwarded"
                   defaultValue={initial?.degreeAwarded ?? ''}
                   placeholder="Bachelor of Arts (B.A.) in Bangla" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField label="Admission fee" name="admissionFee"
                     defaultValue={initial?.admissionFee ?? ''} placeholder="BDT 12,500" />
          <TextField label="Semester fee" name="semesterFee"
                     defaultValue={initial?.semesterFee ?? ''} placeholder="BDT 88,000" />
        </div>
        <p className="text-xs text-gray-500 -mt-2">
          The &ldquo;At a Glance&rdquo; strip shows Credit, Semester format, Admission fee and
          Semester fee. Any left blank is hidden. Degree awarded is used for page metadata.
        </p>
      </Card>

      <Card title="Career prospects (optional)">
        <TextAreaField label="Intro paragraph(s)" name="careerIntro" rows={5}
                       defaultValue={initial?.careerIntro ?? ''}
                       placeholder="Opening copy above the career list. Blank line between paragraphs." />
        <TextAreaField label="Career opportunities (one per line)" name="careerItems" rows={8}
                       defaultValue={(initial?.careerItems ?? []).join('\n')}
                       placeholder={'Teaching and Academia — …\nBangladesh Civil Service (BCS) — …'} />
        <TextAreaField label="Closing note" name="careerClosing" rows={3}
                       defaultValue={initial?.careerClosing ?? ''} />
        <p className="text-xs text-gray-500 -mt-2">
          The whole Career Prospects section is hidden when all three are blank.
        </p>
      </Card>

      <Card title="Course structure">
        <p className="text-sm text-gray-600">
          Courses and the credit distribution table are managed separately at{' '}
          <Link href={initial ? `/admin/programs/${initial.id}/courses` : '/admin/programs'}
                className="text-accent font-medium hover:underline">
            Program courses
          </Link>
          {!initial && ' (available after the program is created)'}.
        </p>
      </Card>

      <Card title="Image (optional)">
        <ImageUploader kind="program-image" name="image"
                       initialUrl={initial?.imageUrl}
                       initialPublicId={initial?.imagePublicId} />
      </Card>

      {state.ok === false && (
        <div role="alert"
             className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <Link href="/admin/programs"
              className="px-4 py-2.5 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors">
          ← Back to list
        </Link>
        <button type="submit" disabled={pending}
                className="bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-5 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent/40">
          {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create program'}
        </button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">{title}</h2>
      {children}
    </section>
  );
}

function TextField({
  label, name, defaultValue, required, type = 'text', placeholder,
}: {
  label: string; name: string; defaultValue?: string;
  required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <input id={name} name={name} type={type}
             defaultValue={defaultValue} required={required} placeholder={placeholder}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
    </div>
  );
}

function TextAreaField({
  label, name, defaultValue, required, rows = 3, placeholder,
}: {
  label: string; name: string; defaultValue?: string;
  required?: boolean; rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <textarea id={name} name={name}
                defaultValue={defaultValue} required={required}
                rows={rows} placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent resize-y" />
    </div>
  );
}
