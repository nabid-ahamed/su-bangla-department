'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import {
  saveProgramCoursesAction,
  type ActionResult,
} from '@/lib/admin-actions/program-courses';

type State = ActionResult | { ok: null };

export type CourseRow = {
  key: string;
  semesterLabel: string;
  courseCode: string;
  courseTitle: string;
  credits: string;
  courseType: string;
  prerequisite: string;
};

export type InitialCourse = {
  id: string;
  semesterLabel: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  courseType: string;
  prerequisite: string | null;
};

// Row identity has to survive inserts and deletes, so keys are minted
// per row rather than taken from the array index.
let nextKey = 0;
const mintKey = () => `row-${nextKey++}`;

export default function CoursesEditor({
  programId,
  programName,
  initial,
}: {
  programId: string;
  programName: string;
  initial: InitialCourse[];
}) {
  const [rows, setRows] = useState<CourseRow[]>(() =>
    initial.map((c) => ({
      key: mintKey(),
      semesterLabel: c.semesterLabel,
      courseCode: c.courseCode,
      courseTitle: c.courseTitle,
      credits: String(c.credits),
      courseType: c.courseType,
      prerequisite: c.prerequisite ?? '',
    })),
  );

  const [state, formAction, pending] = useActionState<State, FormData>(
    saveProgramCoursesAction.bind(null, programId),
    { ok: null },
  );

  useEffect(() => {
    if (state.ok === true) toast.success('Course structure saved');
    if (state.ok === false) toast.error(state.error);
  }, [state]);

  const update = (key: string, field: keyof CourseRow, value: string) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const remove = (key: string) => setRows((rs) => rs.filter((r) => r.key !== key));

  // A new row inherits the semester above it — adding six courses to
  // one semester shouldn't mean typing the label six times.
  const addRow = () =>
    setRows((rs) => [
      ...rs,
      {
        key: mintKey(),
        semesterLabel: rs.length ? rs[rs.length - 1].semesterLabel : '',
        courseCode: '',
        courseTitle: '',
        credits: '3',
        courseType: 'Core',
        prerequisite: '',
      },
    ]);

  const total = rows.reduce((sum, r) => {
    const n = Number(r.credits);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  const semesterCount = new Set(rows.map((r) => r.semesterLabel).filter(Boolean)).size;

  return (
    <form action={formAction} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-5 py-4">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{rows.length}</span> courses ·{' '}
          <span className="font-semibold text-gray-900">{semesterCount}</span> semesters ·{' '}
          <span className="font-semibold text-gray-900">
            {Number.isInteger(total) ? total : total.toFixed(2)}
          </span>{' '}
          credits
        </div>
        <button type="button" onClick={addRow}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-accent hover:text-primary">
          <Plus size={15} /> Add course
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              <th className="px-3 py-2.5">Semester</th>
              <th className="px-3 py-2.5">Code</th>
              <th className="px-3 py-2.5">Course title</th>
              <th className="w-20 px-3 py-2.5">Credits</th>
              <th className="w-28 px-3 py-2.5">Type</th>
              <th className="px-3 py-2.5">Prerequisite</th>
              <th className="w-12 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.key} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-2">
                  <Cell name={`semesterLabel.${i}`} value={r.semesterLabel}
                        onChange={(v) => update(r.key, 'semesterLabel', v)}
                        placeholder="1st Year 1st Semester" />
                </td>
                <td className="px-3 py-2">
                  <Cell name={`courseCode.${i}`} value={r.courseCode}
                        onChange={(v) => update(r.key, 'courseCode', v)} placeholder="Ban 1101" />
                </td>
                <td className="px-3 py-2">
                  <Cell name={`courseTitle.${i}`} value={r.courseTitle}
                        onChange={(v) => update(r.key, 'courseTitle', v)}
                        placeholder="History of Bangla Literature-1" />
                </td>
                <td className="px-3 py-2">
                  <Cell name={`credits.${i}`} value={r.credits} inputMode="decimal"
                        onChange={(v) => update(r.key, 'credits', v)} placeholder="3" />
                </td>
                <td className="px-3 py-2">
                  <select name={`courseType.${i}`} value={r.courseType}
                          onChange={(e) => update(r.key, 'courseType', e.target.value)}
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40">
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <Cell name={`prerequisite.${i}`} value={r.prerequisite}
                        onChange={(v) => update(r.key, 'prerequisite', v)} placeholder="None" />
                </td>
                <td className="px-3 py-2 text-center">
                  <button type="button" onClick={() => remove(r.key)}
                          aria-label={`Remove ${r.courseTitle || 'course'}`}
                          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
                  No courses yet. Use “Add course” to build the curriculum.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Semesters are grouped by their label and appear in the order they first show up in this
        table. Rows with an empty course title or semester are discarded on save.
      </p>

      {state.ok === false && (
        <div role="alert"
             className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link href={`/admin/programs/${programId}`}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900">
          ← Back to {programName}
        </Link>
        <button type="submit" disabled={pending}
                className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? 'Saving…' : 'Save course structure'}
        </button>
      </div>
    </form>
  );
}

function Cell({
  name, value, onChange, placeholder, inputMode,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: 'decimal';
}) {
  return (
    <input
      name={name}
      value={value}
      inputMode={inputMode}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40"
    />
  );
}
