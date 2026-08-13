'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import {
  updateDepartmentLayoutAction,
  type ActionResult,
} from '@/lib/admin-actions/department-layout';

type State = ActionResult | { ok: null };

export type OfficeRow = {
  key: string;
  officeName: string;
  level: string;
  building: string;
  isHighlighted: boolean;
};

export type InitialLayout = {
  universityName: string;
  departmentName: string;
  addressLine: string | null;
  officeColumnLabel: string;
  locationColumnLabel: string;
  downloadHeading: string;
  downloadSubtitle: string | null;
  documentTitle: string;
  coverUrl: string | null;
  coverPublicId: string | null;
  pdfUrl: string | null;
  pdfPublicId: string | null;
  pdfFileName: string | null;
  offices: {
    id: string;
    officeName: string;
    level: string;
    building: string | null;
    isHighlighted: boolean;
  }[];
} | null;

// Row identity must survive inserts, deletes and moves, so keys are
// minted per row rather than taken from the array index.
let nextKey = 0;
const mintKey = () => `office-${nextKey++}`;

const DEFAULT_LEVEL = 'Level 01, Sonargaon University';

export default function DepartmentLayoutForm({ initial }: { initial: InitialLayout }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    updateDepartmentLayoutAction,
    { ok: null },
  );

  const [rows, setRows] = useState<OfficeRow[]>(() =>
    (initial?.offices ?? []).map((o) => ({
      key: mintKey(),
      officeName: o.officeName,
      level: o.level,
      building: o.building ?? '',
      isHighlighted: o.isHighlighted,
    })),
  );

  const [pdf, setPdf] = useState({
    url: initial?.pdfUrl ?? '',
    publicId: initial?.pdfPublicId ?? '',
    fileName: initial?.pdfFileName ?? '',
  });

  useEffect(() => {
    if (state.ok === true) toast.success('Department layout saved');
    if (state.ok === false) toast.error(state.error);
  }, [state]);

  const update = (key: string, field: keyof OfficeRow, value: string | boolean) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const remove = (key: string) => setRows((rs) => rs.filter((r) => r.key !== key));

  // A new row inherits the level above it — a floor usually holds
  // several offices, so this saves retyping.
  const addRow = () =>
    setRows((rs) => [
      ...rs,
      {
        key: mintKey(),
        officeName: '',
        level: rs.length ? rs[rs.length - 1].level : DEFAULT_LEVEL,
        building: rs.length ? rs[rs.length - 1].building : '',
        isHighlighted: false,
      },
    ]);

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
      <Card title="Card header">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="University name" name="universityName" required
                     defaultValue={initial?.universityName ?? 'Sonargaon University'} />
          <TextField label="Department name" name="departmentName" required
                     defaultValue={initial?.departmentName ?? 'Department of Bangla'} />
        </div>
        <TextField label="Address line" name="addressLine"
                   defaultValue={initial?.addressLine ?? ''}
                   placeholder="147/I, Panthapath, Greenroad, Dhaka-1215" />
      </Card>

      <Card title="Table column headings">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Left column" name="officeColumnLabel" required
                     defaultValue={initial?.officeColumnLabel ?? 'Name of the Office'} />
          <TextField label="Right column" name="locationColumnLabel" required
                     defaultValue={initial?.locationColumnLabel ?? 'Specific Location of the Office'} />
        </div>
      </Card>

      <Card title="Offices">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{rows.length}</span> offices ·{' '}
            <span className="font-semibold text-gray-900">
              {rows.filter((r) => r.isHighlighted).length}
            </span>{' '}
            highlighted
          </p>
          <button type="button" onClick={addRow}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-accent hover:text-primary">
            <Plus size={15} /> Add office
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={r.key} className="rounded-lg border border-gray-200 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                <Cell label="Office name" name={`officeName.${i}`} value={r.officeName}
                      onChange={(v) => update(r.key, 'officeName', v)}
                      placeholder="Office of the Registrar" />
                <Cell label="Level" name={`level.${i}`} value={r.level}
                      onChange={(v) => update(r.key, 'level', v)}
                      placeholder="Level 01, Sonargaon University" />
                <Cell label="Building" name={`building.${i}`} value={r.building}
                      onChange={(v) => update(r.key, 'building', v)}
                      placeholder="147/I, Panthapath, Greenroad, Dhaka" />
                <div className="flex items-end gap-1 pb-1">
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
              <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name={`highlighted.${i}`} checked={r.isHighlighted}
                       onChange={(e) => update(r.key, 'isHighlighted', e.target.checked)}
                       className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-accent/40" />
                Highlight this row (bold, brand colour)
              </label>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="rounded-lg border border-dashed border-gray-300 px-3 py-8 text-center text-sm text-gray-500">
              No offices yet. Use “Add office” to build the directory.
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Rows appear on the page in this order. Rows with an empty office name are discarded on save.
        </p>
      </Card>

      <Card title="Download block">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Section heading" name="downloadHeading" required
                     defaultValue={initial?.downloadHeading ?? 'Download the plan'} />
          <TextField label="Document title" name="documentTitle" required
                     defaultValue={initial?.documentTitle ?? 'Departmental Layout Plan'} />
        </div>
        <TextField label="Section subtitle" name="downloadSubtitle"
                   defaultValue={initial?.downloadSubtitle ?? ''}
                   placeholder="The same directory as a printable document." />
      </Card>

      <Card title="Cover image (optional)">
        <p className="-mt-2 text-xs text-gray-500">
          Shown above the download buttons at <strong>600×800</strong> (3:4 portrait). The image is
          displayed uncropped, so any aspect ratio works — the card grows to fit. Leave empty to
          show the “Cover image coming soon” placeholder.
        </p>
        <ImageUploader kind="department-layout-cover" name="cover"
                       initialUrl={initial?.coverUrl}
                       initialPublicId={initial?.coverPublicId} />
      </Card>

      <Card title="Layout plan PDF">
        <p className="-mt-2 text-xs text-gray-500">
          The download section is hidden on the public page until a PDF is attached.
        </p>
        <ImageUploader
          kind="department-layout-pdf"
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

function Cell({
  label, name, value, onChange, placeholder,
}: {
  label: string; name: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <input id={name} name={name} value={value} placeholder={placeholder}
             onChange={(e) => onChange(e.target.value)}
             className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40" />
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
