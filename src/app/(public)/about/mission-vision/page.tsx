import { Eye, Target } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Container from '@/components/ui/Container';
import { getAboutMissionVision } from '@/lib/identity';

export const metadata = {
  title: 'Mission & Vision',
  description:
    'The mission and vision of the Department of Bangla, Sonargaon University.',
};

/**
 * Renders a body field as prose, or as a numbered list when the text
 * uses inline "1. … 2. …" numbering.
 *
 * Admins type these bodies as a single textarea value, so an enumerated
 * mission would otherwise run together as one paragraph. Any text that
 * precedes "1." is kept as an intro line above the list.
 */
function BodyText({ text, align }: { text: string; align: 'left' | 'right' }) {
  const proseClass = `text-[15px] md:text-[16px] leading-[1.85] text-white/90 text-justify`;

  // Split on " 1. ", " 2. " … only when the numbers run in sequence, so
  // stray decimals ("2.5 GPA") or dates don't trigger list mode.
  const parts = text.split(/\s(?=\d+\.\s)/g).map((s) => s.trim()).filter(Boolean);
  const items: string[] = [];
  let intro = '';
  let expected = 1;

  for (const part of parts) {
    const m = /^(\d+)\.\s*(.+)$/s.exec(part);
    if (m && Number(m[1]) === expected) {
      items.push(m[2].trim());
      expected++;
    } else if (items.length === 0) {
      intro = intro ? `${intro} ${part}` : part;
    } else {
      // Trailing prose after the list — append to the last item rather
      // than dropping it.
      items[items.length - 1] += ` ${part}`;
    }
  }

  if (items.length < 2) {
    return <p className={proseClass}>{text}</p>;
  }

  return (
    <div className={align === 'right' ? 'lg:text-right' : undefined}>
      {intro && <p className={`${proseClass} mb-4`}>{intro}</p>}
      <ol className="space-y-3 text-left">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="shrink-0 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-button-yellow/20 border border-button-yellow/40 text-button-yellow text-[11px] font-bold">
              {i + 1}
            </span>
            <span className="text-[15px] md:text-[16px] leading-[1.8] text-white/90">
              {item}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default async function MissionVisionPage() {
  const row = await getAboutMissionVision();
  if (!row) {
    throw new Error(
      'AboutMissionVision row missing (id="singleton"). Run `npm run db:seed`.',
    );
  }

  return (
    <PageShell
      title={row.heroTitle}
      overline={row.heroOverline ?? undefined}
      image={row.heroImageUrl}
      imagePosition={`center ${row.heroImageVerticalPercent}%`}
      contentClassName="bg-gray-50 py-12 md:py-20"
    >
      <Container>
        <div className="space-y-8 lg:space-y-10">
          {/* Mission Card — icon left */}
          <article className="relative bg-primary text-white rounded-2xl shadow-2xl">
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-72 h-72 bg-accent/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
            </div>

            <div className="relative p-5 md:p-12 lg:p-14">
              <div className="grid gap-6 lg:gap-10 lg:grid-cols-[120px_1fr] items-start">
                <div className="flex lg:block">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-button-yellow/15 border border-button-yellow/40 flex items-center justify-center shadow-lg">
                    <Target size={36} className="text-button-yellow" strokeWidth={1.5} />
                  </div>
                </div>

                <div>
                  {row.missionOverline && (
                    <span className="inline-block text-button-yellow text-[11px] font-bold tracking-[0.3em] uppercase mb-2">
                      {row.missionOverline}
                    </span>
                  )}
                  <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                    {row.missionHeading}
                  </h2>
                  <div className="mt-3 mb-6 h-1 w-16 bg-button-yellow rounded-full" />

                  <BodyText text={row.missionBody} align="left" />
                </div>
              </div>
            </div>
          </article>

          {/* Vision Card — icon right */}
          <article className="relative bg-primary text-white rounded-2xl shadow-2xl">
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-72 h-72 bg-accent/15 rounded-full blur-3xl -translate-y-1/3 -translate-x-1/3" />
              <div className="absolute bottom-0 right-0 w-56 h-56 bg-white/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/4" />
            </div>

            <div className="relative p-5 md:p-12 lg:p-14">
              <div className="grid gap-6 lg:gap-10 lg:grid-cols-[1fr_120px] items-start">
                <div className="lg:order-1 lg:text-right">
                  {row.visionOverline && (
                    <span className="inline-block text-button-yellow text-[11px] font-bold tracking-[0.3em] uppercase mb-2">
                      {row.visionOverline}
                    </span>
                  )}
                  <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                    {row.visionHeading}
                  </h2>
                  <div className="mt-3 mb-6 h-1 w-16 bg-button-yellow rounded-full lg:ml-auto" />

                  <BodyText text={row.visionBody} align="right" />
                </div>

                <div className="flex lg:order-2 lg:block lg:justify-end">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-button-yellow/15 border border-button-yellow/40 flex items-center justify-center shadow-lg lg:ml-auto">
                    <Eye size={36} className="text-button-yellow" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </Container>
    </PageShell>
  );
}
