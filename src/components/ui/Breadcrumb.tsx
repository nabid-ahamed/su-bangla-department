'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { getBreadcrumbs } from '@/lib/breadcrumbs';

export default function Breadcrumb({ currentLabel }: { currentLabel?: string } = {}) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname, currentLabel);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/80">
      <a href="/" className="inline-flex items-center gap-1 hover:text-white transition-colors">
        <Home size={14} />
        <span>Home</span>
      </a>
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${idx}`} className="inline-flex items-center gap-2">
            <ChevronRight size={14} className="opacity-60" />
            {isLast ? (
              <span className="text-white font-medium">{crumb.label}</span>
            ) : crumb.href ? (
              <a href={crumb.href} className="hover:text-white transition-colors">
                {crumb.label}
              </a>
            ) : (
              <span className="text-white/60">{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
