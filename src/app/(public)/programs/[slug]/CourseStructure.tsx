'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';

export type CourseRow = {
  id: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  courseType: string;
  prerequisite: string | null;
};

export type Semester = {
  label: string;
  courses: CourseRow[];
  credits: number;
};

// Credits render as "3" not "3.0", but a .75 step must survive —
// so trim only when the value is whole.
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : String(n));

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function CourseStructure({ semesters }: { semesters: Semester[] }) {
  // First semester open on load; the rest collapsed so the section
  // stays scannable with eight of them.
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3">
      {semesters.map((sem, i) => {
        const isOpen = open === i;
        const panelId = `semester-${slugify(sem.label)}`;
        return (
          <div
            key={sem.label}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-gray-50"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                  <BookOpen size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-[15px] font-bold text-primary">
                    {sem.label}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {sem.courses.length} courses · {fmt(sem.credits)} credits
                  </span>
                </span>
              </span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOpen && (
              <div id={panelId} className="overflow-x-auto border-t border-gray-100">
                <table className="w-full min-w-[34rem] text-left text-[14px]">
                  <caption className="sr-only">Courses in {sem.label}</caption>
                  <thead>
                    <tr className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      <th scope="col" className="px-5 py-2.5">Code</th>
                      <th scope="col" className="px-5 py-2.5">Course</th>
                      <th scope="col" className="px-5 py-2.5 text-right">Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.courses.map((c) => (
                      <tr key={c.id} className="border-t border-gray-100">
                        <td className="whitespace-nowrap px-5 py-3 font-mono text-[13px] text-primary">
                          {c.courseCode}
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-medium text-gray-800">{c.courseTitle}</span>
                        </td>
                        <td className="px-5 py-3 text-right font-semibold tabular-nums text-gray-700">
                          {fmt(c.credits)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
