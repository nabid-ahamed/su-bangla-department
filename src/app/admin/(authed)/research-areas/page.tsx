import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import ResearchAreasList from './ResearchAreasList';

export const metadata = { title: 'Research Areas' };

export default async function ResearchAreasPage() {
  const session = await getSession();
  if (!session?.user) redirect('/admin/login');

  const areas = await prisma.researchArea.findMany({
    orderBy: { displayOrder: 'asc' },
  });
  const featured = areas.find((a) => a.isFeatured);

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Research Areas</h1>
          <p className="mt-1 text-sm text-gray-500">
            {areas.length} area{areas.length === 1 ? '' : 's'}
            {areas.length > 1 && ' · drag to reorder'}
          </p>
          {/* Name the featured row up front — its image and copy drive the
              large card on the homepage, which is not obvious from the
              list alone. */}
          {featured && (
            <p className="mt-1 text-xs text-gray-500">
              <span className="font-semibold text-accent">{featured.areaName}</span> is the
              featured card on the homepage — edit it to change that card&apos;s image and text.
            </p>
          )}
        </div>
        <Link
          href="/admin/research-areas/new"
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          <Plus size={16} /> Add research area
        </Link>
      </header>

      <ResearchAreasList items={areas} />
    </div>
  );
}
