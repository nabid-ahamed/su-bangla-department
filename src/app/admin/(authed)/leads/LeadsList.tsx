'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Trash2, Phone } from 'lucide-react';
import { updateLeadStatusAction, deleteLeadAction } from '@/lib/admin-actions/lead-popup';

export type LeadRow = {
  id: string;
  fullName: string;
  phone: string;
  programme: string;
  status: string;
  sourcePath: string | null;
  submittedAt: string;
};

const STATUSES = ['new', 'contacted', 'closed'] as const;

const STATUS_STYLE: Record<string, string> = {
  new:       'bg-accent/10 text-accent',
  contacted: 'bg-amber-100 text-amber-700',
  closed:    'bg-gray-100 text-gray-600',
};

export default function LeadsList({ initial }: { initial: LeadRow[] }) {
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<'all' | (typeof STATUSES)[number]>('all');

  const shown = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  function setStatus(id: string, status: string) {
    // Optimistic — the row updates immediately, and reverts on failure.
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    startTransition(async () => {
      const res = await updateLeadStatusAction(id, status);
      if (!res.ok) { setRows(prev); toast.error(res.error); }
    });
  }

  function remove(id: string) {
    const prev = rows;
    setRows((rs) => rs.filter((r) => r.id !== id));
    startTransition(async () => {
      const res = await deleteLeadAction(id);
      if (!res.ok) { setRows(prev); toast.error(res.error); }
      else toast.success('Lead deleted');
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['all', ...STATUSES] as const).map((f) => {
          const count = f === 'all' ? rows.length : rows.filter((r) => r.status === f).length;
          return (
            <button key={f} type="button" onClick={() => setFilter(f)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                      filter === f
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 bg-white text-gray-700 hover:border-accent'
                    }`}>
              {f} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-12 text-center text-sm text-gray-500">
          No leads {filter === 'all' ? 'yet' : `with status “${filter}”`}.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">Received</th>
                <th className="px-4 py-3">Status</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.fullName}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <a href={`tel:${r.phone}`}
                       className="inline-flex items-center gap-1.5 text-accent hover:underline">
                      <Phone size={13} />
                      {r.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.programme}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">{r.submittedAt}</td>
                  <td className="px-4 py-3">
                    <select value={r.status} disabled={pending}
                            onChange={(e) => setStatus(r.id, e.target.value)}
                            className={`rounded-full px-3 py-1 text-[12px] font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-accent/40 ${STATUS_STYLE[r.status] ?? ''}`}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button type="button" onClick={() => remove(r.id)} disabled={pending}
                            aria-label={`Delete lead from ${r.fullName}`}
                            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
