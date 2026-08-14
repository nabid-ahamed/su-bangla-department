import { notFound } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import Container from '@/components/ui/Container';
import { getSyllabi, getPageHero } from '@/lib/identity';
import { SYLLABUS_PAGE_ENABLED } from '@/lib/feature-flags';
import SyllabusClient from './SyllabusClient';

// While the page is switched off it renders the 404 body, so the title
// and robots directive follow suit rather than advertising a page that
// no longer resolves.
export const metadata = SYLLABUS_PAGE_ENABLED
  ? {
      title: 'Syllabus',
      description:
        'Course-by-course syllabus for the Department of Bangla, Sonargaon University.',
    }
  : { title: 'Page Not Found', robots: { index: false, follow: false } };

export default async function SyllabusPage() {
  // Temporarily switched off — see SYLLABUS_PAGE_ENABLED. The nav entry is
  // greyed out via its isDisabled flag; this stops the URL being reachable
  // directly. All syllabus data and the admin screens are untouched.
  if (!SYLLABUS_PAGE_ENABLED) notFound();

  const [items, hero] = await Promise.all([
    getSyllabi(),
    getPageHero('student-society-syllabus'),
  ]);

  return (
    <PageShell
      title={hero?.heroTitle ?? 'Syllabus'}
      subtitle={hero?.heroSubtitle ?? undefined}
      overline={hero?.heroOverline ?? 'Student'}
      image={hero?.heroImageUrl ?? '/assets/syllabus-hero.webp'}
      imagePosition={hero ? `center ${hero.heroImageVerticalPercent}%` : undefined}
      contentClassName="bg-gray-50 py-12 md:py-20"
    >
      <Container>
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
          <p className="text-base md:text-lg text-gray-700 leading-[1.85]">
            Course-by-course syllabus for the Department of Bangla. Download the official PDF for detailed credit distribution, course outcomes, and reference materials.
          </p>
        </div>

        <SyllabusClient
          items={items.map((s) => ({
            slug:       s.slug,
            title:      s.title,
            shortTitle: s.shortTitle,
            department: s.department,
            level:      s.level,
            coverUrl:   s.coverUrl,
            pdfUrl:     s.pdfUrl,
            pdfFileName: s.pdfFileName,
            summary:    s.summary,
          }))}
        />
      </Container>
    </PageShell>
  );
}
