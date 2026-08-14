import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import ServiceCharterForm from './ServiceCharterForm';

export const metadata = { title: 'Student Society — Service Charter' };

export default async function ServiceCharterAdminPage() {
  const session = await getSession();
  if (!session?.user) redirect('/admin/login');

  const row = await prisma.serviceCharter.findUnique({
    where: { id: 'singleton' },
    include: { items: { orderBy: { displayOrder: 'asc' } } },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          Student Society — Service Charter
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Service cards and downloadable charter for{' '}
          <code className="font-mono">/student-society/service-charter</code>.
        </p>
      </header>
      <ServiceCharterForm initial={row} />
    </div>
  );
}
