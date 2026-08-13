import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import DepartmentLayoutForm from './DepartmentLayoutForm';

export const metadata = { title: 'About — Department Layout' };

export default async function DepartmentLayoutAdminPage() {
  const session = await getSession();
  if (!session?.user) redirect('/admin/login');

  const row = await prisma.departmentLayout.findUnique({
    where: { id: 'singleton' },
    include: { offices: { orderBy: { displayOrder: 'asc' } } },
  });

  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-900">
          About — Department Layout
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Office directory and downloadable plan for{' '}
          <code className="font-mono">/about/department-layout</code>.
        </p>
      </header>
      <DepartmentLayoutForm initial={row} />
    </div>
  );
}
