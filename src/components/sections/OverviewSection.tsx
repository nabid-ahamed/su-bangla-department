'use client';

import Image from 'next/image';
import {motion} from 'motion/react';
import Container from '../ui/Container';

type OverviewSectionProps = {
  // Falls back to departmentName when the CMS heading is blank.
  heading: string | null;
  // Pre-sanitized HTML from HomeOverview.body.
  body: string;
  imageUrl: string;
  imageAlt: string | null;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  primaryCtaExternal: boolean;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  secondaryCtaExternal: boolean;
  // Used for the heading fallback and the generated alt fallback.
  departmentName: string;
  universityName: string;
};

export default function OverviewSection({
  heading,
  body,
  imageUrl,
  imageAlt,
  primaryCtaLabel,
  primaryCtaHref,
  primaryCtaExternal,
  secondaryCtaLabel,
  secondaryCtaHref,
  secondaryCtaExternal,
  departmentName,
  universityName,
}: OverviewSectionProps) {
  const bareName = departmentName.replace(/^Department of\s+/i, '');
  const resolvedHeading = heading?.trim() || departmentName;
  const resolvedAlt =
    imageAlt?.trim() || `${universityName} ${bareName} students in a seminar session`;

  const ctaClass =
    'rounded-full bg-gradient-to-r from-primary to-accent px-8 py-3 text-center text-base font-semibold text-white shadow-md transition-all hover:shadow-premium';

  return (
    <section className="bg-white py-8 md:py-16">
      <Container className="!max-w-[1120px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 md:mb-8 text-center text-2xl font-bold leading-tight text-primary md:text-[25px]"
        >
          {resolvedHeading}
        </motion.h2>

        <div className="mx-auto grid max-w-[1090px] items-start gap-8 lg:gap-12 lg:grid-cols-[520px_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 space-y-6"
          >
            {/* body is sanitized server-side before it reaches this
                client component (see admin-actions/home-overview.ts). */}
            <div
              className="text-justify text-[16px] font-medium leading-[1.75] tracking-[0.035em] text-black [&_p]:mb-4 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: body }}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <a
                href={primaryCtaHref}
                className={ctaClass}
                {...(primaryCtaExternal
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {primaryCtaLabel}
              </a>
              <a
                href={secondaryCtaHref}
                className={ctaClass}
                {...(secondaryCtaExternal
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {secondaryCtaLabel}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 overflow-hidden"
          >
            <Image
              src={imageUrl}
              alt={resolvedAlt}
              width={1600}
              height={900}
              sizes="(min-width: 1024px) 540px, 100vw"
              className="h-auto w-full object-cover lg:h-[294px]"
            />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
