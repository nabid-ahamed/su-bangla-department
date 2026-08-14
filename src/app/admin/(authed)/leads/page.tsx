import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import LeadsList from './LeadsList';

export const metadata = { title: 'Leads' };

export default async function LeadsAdminPage() {
  const session = await getSession();
  if (!session?.user) redirect('/admin/login');

  const rows = await prisma.lead.findMany({ orderBy: { submittedAt: 'desc' } });

  return (
    <div className="max-w-5xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-900">Leads</h1>
        <p className="mt-1 text-sm text-gray-500">
          Admission enquiries from the homepage popup. Configure the popup in{' '}
          <a href="/admin/lead-popup" className="font-medium text-accent hover:underline">
            Lead Popup
          </a>
          .
        </p>
      </header>

      <LeadsList
        initial={rows.map((r) => ({
          id: r.id,
          fullName: r.fullName,
          phone: r.phone,
          programme: r.programme,
          status: r.status,
          sourcePath: r.sourcePath,
          // Formatted on the server so the list renders identically
          // regardless of the admin's locale.
          submittedAt: r.submittedAt.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          }),
        }))}
      />
    </div>
  );
}
