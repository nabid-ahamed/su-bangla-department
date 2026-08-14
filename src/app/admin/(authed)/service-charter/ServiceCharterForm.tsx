'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  updateServiceCharterAction,
  type ActionResult,
} from '@/lib/admin-actions/service-charter';

type State = ActionResult | { ok: null };

type Row = {
  key: string;
  title: string;
  steps: string;
  responsibleName: string;
  responsibleRole: string;
  responsiblePhone: string;
  responsibleEmail: string;
  responsibleRoom: string;
  responsible2Name: string;
  responsible2Role: string;
  responsible2Phone: string;
  responsible2Email: string;
  responsible2Room: string;
};

export type InitialCharter = {
  intro: string | null;
  pdfHeading: string;
  pdfSubtitle: string | null;
  pdfUrl: string | null;
  pdfPublicId: string | null;
  pdfFileName: string | null;
  items: {
    id: string;
    title: string;
    steps: string[];
    responsibleName: string | null;
    responsibleRole: string | null;
    responsiblePhone: string | null;
    responsibleEmail: string | null;
    responsibleRoom: string | null;
    responsible2Name: string | null;
    responsible2Role: string | null;
    responsible2Phone: string | null;
    responsible2Email: string | null;
    responsible2Room: string | null;
  }[];
} | null;

let nextKey = 0;
const mintKey = () => `svc-${nextKey++}`;

const blank = (): Row => ({
  key: mintKey(),
  title: '', steps: '',
  responsibleName: '', responsibleRole: '', responsiblePhone: '',
  responsibleEmail: '', responsibleRoom: '',
  responsible2Name: '', responsible2Role: '', responsible2Phone: '',
  responsible2Email: '', responsible2Room: '',
});

export default function ServiceCharterForm({ initial }: { initial: InitialCharter }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    updateServiceCharterAction,
    { ok: null },
  );

  const [rows, setRows] = useState<Row[]>(() =>
    (initial?.items ?? []).map((it) => ({
      key: mintKey(),
      title: it.title,
      steps: it.steps.join('\n'),
      responsibleName: it.responsibleName ?? '',
      responsibleRole: it.responsibleRole ?? '',
      responsiblePhone: it.responsiblePhone ?? '',
      responsibleEmail: it.responsibleEmail ?? '',
      responsibleRoom: it.responsibleRoom ?? '',
      responsible2Name: it.responsible2Name ?? '',
      responsible2Role: it.responsible2Role ?? '',
      responsible2Phone: it.responsible2Phone ?? '',
      responsible2Email: it.responsible2Email ?? '',
      responsible2Room: it.responsible2Room ?? '',
    })),
  );

  const [pdf, setPdf] = useState({
    url: initial?.pdfUrl ?? '',
    publicId: initial?.pdfPublicId ?? '',
    fileName: initial?.pdfFileName ?? '',
  });

  useEffect(() => {
    if (state.ok === true) toast.success('Service charter saved');
    if (state.ok === false) toast.error(state.error);
  }, [state]);

  const update = (key: string, field: keyof Row, value: string) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  const remove = (key: string) => setRows((rs) => rs.filter((r) => r.key !== key));
  const move = (index: number, delta: number) =>
    setRows((rs) => {
      const to = index + delta;
      if (to < 0 || to >= rs.length) return rs;
      const next = [...rs];
      [next[index], next[to]] = [next[to], next[index]];
      return next;
    });

  return (
    <form action={formAction} className="space-y-6">
      <Card title="Page intro">
        <TextAreaField label="Intro line (optional)" name="intro" rows={3}
                       defaultValue={initial?.intro ?? ''}
                       placeholder="What to do, in what order, and who to ask…" />
      </Card>

      <Card title="Services">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{rows.length}</span> services
          </p>
          <button type="button" onClick={() => setRows((rs) => [...rs, blank()])}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-accent hover:text-primary">
            <Plus size={15} /> Add service
          </button>
        </div>

        <div className="space-y-4">
          {rows.map((r, i) => (
            <div key={r.key} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex gap-1">
                  <IconBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowUp size={15} />
                  </IconBtn>
                  <IconBtn label="Move down" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>
                    <ArrowDown size={15} />
                  </IconBtn>
                  <IconBtn label="Remove" onClick={() => remove(r.key)} danger>
                    <Trash2 size={15} />
                  </IconBtn>
                </div>
              </div>

              <Field label="Service title" name={`title.${i}`} value={r.title}
                     onChange={(v) => update(r.key, 'title', v)} />

              <div className="mt-3">
                <label htmlFor={`steps.${i}`} className="mb-1 block text-xs font-medium text-gray-600">
                  Process steps — one per line
                </label>
                <textarea id={`steps.${i}`} name={`steps.${i}`} rows={3} value={r.steps}
                          onChange={(e) => update(r.key, 'steps', e.target.value)}
                          placeholder={'Accounts Clearance (Room no: 313)\nMeet with Batch Advisor'}
                          className="w-full resize-y rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40" />
                <p className="mt-1 text-[11px] text-gray-500">
                  One line shows as an arrow bullet; two or more show as a numbered list.
                </p>
              </div>

              <OfficerFields idx={i} row={r} update={update} prefix="responsible" heading="Responsible person" />
              <OfficerFields idx={i} row={r} update={update} prefix="responsible2" heading="Second person (optional)" />
            </div>
          ))}
          {rows.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-300 px-3 py-8 text-center text-sm text-gray-500">
              No services yet. Use “Add service” to build the charter.
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Cards appear in this order. Rows with an empty title are discarded on save.
        </p>
      </Card>

      <Card title="Downloadable PDF">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Heading" name="pdfHeading" required
                     defaultValue={initial?.pdfHeading ?? 'Service Charter as a PDF'} />
          <TextField label="Subtitle" name="pdfSubtitle"
                     defaultValue={initial?.pdfSubtitle ?? ''} />
        </div>
        <p className="text-xs text-gray-500">
          The download strip is hidden on the public page until a PDF is attached.
        </p>
        <ImageUploader
          kind="service-charter-pdf"
          name="pdf"
          accept="application/pdf"
          initialUrl={pdf.url}
          initialPublicId={pdf.publicId}
          initialFileType="pdf"
          initialFileName={pdf.fileName}
          onChange={(url, publicId, meta) => {
            setPdf({ url, publicId, fileName: meta?.fileName ?? '' });
          }}
        />
        <input type="hidden" name="pdfUrl" value={pdf.url} />
        <input type="hidden" name="pdfPublicId" value={pdf.publicId} />
        <input type="hidden" name="pdfFileName" value={pdf.fileName} />
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

function OfficerFields({
  idx, row, update, prefix, heading,
}: {
  idx: number;
  row: Row;
  update: (key: string, field: keyof Row, value: string) => void;
  prefix: 'responsible' | 'responsible2';
  heading: string;
}) {
  const f = (suffix: string) => `${prefix}${suffix}` as keyof Row;
  return (
    <fieldset className="mt-4 rounded-md bg-gray-50 p-3">
      <legend className="px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {heading}
      </legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Field label="Name" name={`${prefix}Name.${idx}`} value={row[f('Name')] as string}
               onChange={(v) => update(row.key, f('Name'), v)} />
        <Field label="Role" name={`${prefix}Role.${idx}`} value={row[f('Role')] as string}
               onChange={(v) => update(row.key, f('Role'), v)} />
        <Field label="Phone" name={`${prefix}Phone.${idx}`} value={row[f('Phone')] as string}
               onChange={(v) => update(row.key, f('Phone'), v)} />
        <Field label="Email" name={`${prefix}Email.${idx}`} value={row[f('Email')] as string}
               onChange={(v) => update(row.key, f('Email'), v)} />
        <Field label="Room" name={`${prefix}Room.${idx}`} value={row[f('Room')] as string}
               onChange={(v) => update(row.key, f('Room'), v)} />
      </div>
    </fieldset>
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

function Field({
  label, name, value, onChange,
}: {
  label: string; name: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <input id={name} name={name} value={value} onChange={(e) => onChange(e.target.value)}
             className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40" />
    </div>
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

function TextAreaField({
  label, name, defaultValue, rows = 3, placeholder,
}: {
  label: string; name: string; defaultValue?: string;
  rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue} rows={rows} placeholder={placeholder}
                className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/50" />
    </div>
  );
}

function IconBtn({
  label, onClick, children, disabled, danger,
}: {
  label: string; onClick: () => void; children: React.ReactNode;
  disabled?: boolean; danger?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}
            className={`rounded p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
              danger
                ? 'text-gray-400 hover:bg-red-50 hover:text-red-600'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
            }`}>
      {children}
    </button>
  );
}
