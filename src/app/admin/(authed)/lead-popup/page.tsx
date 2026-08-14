import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import LeadPopupForm from './LeadPopupForm';

export const metadata = { title: 'Lead Popup' };

export default async function LeadPopupAdminPage() {
  const session = await getSession();
  if (!session?.user) redirect('/admin/login');

  const row = await prisma.leadPopup.findUnique({ where: { id: 'singleton' } });

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-900">Lead Popup</h1>
        <p className="mt-1 text-sm text-gray-500">
          The admission-enquiry popup shown on the homepage. Submissions arrive in{' '}
          <a href="/admin/leads" className="font-medium text-accent hover:underline">Leads</a>.
        </p>
      </header>
      <LeadPopupForm initial={row} />
    </div>
  );
}
