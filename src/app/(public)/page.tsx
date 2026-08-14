import dynamic from 'next/dynamic';
import HeroSection from '@/components/sections/HeroSection';
import LeadPopup from '@/components/sections/LeadPopup';
import {
  getDepartmentIdentity,
  getUniversityIdentity,
  getHomeOverview,
  getProgramsWithCta,
  getResearchAreas,
  getNewsHomeTop,
  getEventsHomeTop,
  getNoticesHomeTop,
  getLeadPopup,
} from '@/lib/identity';

function sectionSkeleton(minHeight: string) {
  return function Skeleton() {
    return <div className={`${minHeight} bg-white`} aria-hidden="true" />;
  };
}

const OverviewSection = dynamic(() => import('@/components/sections/OverviewSection'), {
  loading: sectionSkeleton('min-h-[500px]'),
});
const ProgramsSection = dynamic(() => import('@/components/sections/ProgramsSection'), {
  loading: sectionSkeleton('min-h-[500px]'),
});
const QuickLinksSection = dynamic(() => import('@/components/sections/QuickLinksSection'), {
  loading: sectionSkeleton('min-h-[300px]'),
});
const NoticesSection = dynamic(() => import('@/components/sections/NoticesSection'), {
  loading: sectionSkeleton('min-h-[400px]'),
});
const MajorResearchSection = dynamic(() => import('@/components/sections/MajorResearchSection'), {
  loading: sectionSkeleton('min-h-[500px]'),
});
const EventsSection = dynamic(() => import('@/components/sections/EventsSection'), {
  loading: sectionSkeleton('min-h-[500px]'),
});
const NewsSection = dynamic(() => import('@/components/sections/NewsSection'), {
  loading: sectionSkeleton('min-h-[500px]'),
});
const ServicesSection = dynamic(() => import('@/components/sections/ServicesSection'), {
  loading: sectionSkeleton('min-h-[400px]'),
});

export default async function HomePage() {
  const [dept, uni, overview, programs, researchAreas, newsTop, eventsTop, noticesTop, leadPopup] =
    await Promise.all([
      getDepartmentIdentity(),
      getUniversityIdentity(),
      getHomeOverview(),
      getProgramsWithCta(),
      getResearchAreas(),
      getNewsHomeTop(),
      getEventsHomeTop(),
      getNoticesHomeTop(),
      getLeadPopup(),
    ]);
  return (
    <>
      <HeroSection
        imageUrls={[dept.heroImage1Url, dept.heroImage2Url, dept.heroImage3Url]}
        imageAlts={[dept.heroImage1Alt, dept.heroImage2Alt, dept.heroImage3Alt]}
        imageVerticalPercents={[
          dept.heroImage1VerticalPercent,
          dept.heroImage2VerticalPercent,
          dept.heroImage3VerticalPercent,
        ]}
        breadcrumbLabel={dept.breadcrumbLabel}
        departmentName={dept.name}
        shortCode={dept.shortCode}
        universityName={uni.name}
      />
      {/* Falls back to sane defaults if the HomeOverview row is
          missing (fresh DB before the migration insert runs), so the
          homepage never renders a hole. */}
      <OverviewSection
        heading={overview?.heading ?? null}
        body={
          overview?.body ??
          `<p>Learn more about the ${dept.name} at ${uni.name}.</p>`
        }
        imageUrl={overview?.imageUrl ?? '/assets/homeimg.webp'}
        imageAlt={overview?.imageAlt ?? null}
        primaryCtaLabel={overview?.primaryCtaLabel ?? 'Explore More'}
        primaryCtaHref={overview?.primaryCtaHref ?? '/about/overview'}
        primaryCtaExternal={overview?.primaryCtaExternal ?? false}
        secondaryCtaLabel={overview?.secondaryCtaLabel ?? "Dean's Message"}
        secondaryCtaHref={overview?.secondaryCtaHref ?? '/about/deans-message'}
        secondaryCtaExternal={overview?.secondaryCtaExternal ?? false}
        departmentName={dept.name}
        universityName={uni.name}
      />
      <ProgramsSection programs={programs} />
      <QuickLinksSection />
      <NoticesSection notices={noticesTop} departmentName={dept.name} />
      <MajorResearchSection areas={researchAreas} />
      <EventsSection events={eventsTop} shortCode={dept.shortCode} />
      <NewsSection news={newsTop} />
      <ServicesSection />
      {leadPopup && <LeadPopup config={leadPopup} />}
    </>
  );
}
