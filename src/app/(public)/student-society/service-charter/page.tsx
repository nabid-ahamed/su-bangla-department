import { ArrowRight, User, FileText, Download } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Container from '@/components/ui/Container';
import { getServiceCharter, getPageHero } from '@/lib/identity';

export const revalidate = 3600;

export const metadata = {
  title: 'Service Charter',
  description:
    'What to do, in what order, and who to ask for student services at the Department of Bangla, Sonargaon University.',
};

type Officer = {
  name: string | null;
  role: string | null;
  phone: string | null;
  email: string | null;
  room: string | null;
};

/**
 * Steps and contact blurbs arrive as plain text that often contains a
 * URL or an email. Rendering them raw would leave those unclickable,
 * so split on both and linkify each match.
 */
function Linkify({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noreferrer"
              className="break-all text-accent underline underline-offset-2 hover:text-primary"
            >
              {part}
            </a>
          );
        }
        if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part)) {
          return (
            <a
              key={i}
              href={`mailto:${part}`}
              className="break-all text-accent underline underline-offset-2 hover:text-primary"
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function OfficerBlock({ officer }: { officer: Officer }) {
  if (!officer.name) return null;
  return (
    <div className="flex gap-2.5">
      <User size={15} className="mt-0.5 shrink-0 text-gray-400" />
      <div className="min-w-0 text-[13px] leading-relaxed">
        <p className="font-bold text-primary">
          {officer.name}
          {officer.role && ` (${officer.role})`}
        </p>
        {officer.phone && (
          <p className="text-gray-600">
            Contact No:{' '}
            <a
              href={`tel:${officer.phone.replace(/[^\d+]/g, '')}`}
              className="text-accent underline underline-offset-2 hover:text-primary"
            >
              {officer.phone}
            </a>
          </p>
        )}
        {officer.email && (
          <p className="text-gray-600">
            e-mail:{' '}
            <a
              href={`mailto:${officer.email}`}
              className="break-all text-accent underline underline-offset-2 hover:text-primary"
            >
              {officer.email}
            </a>
          </p>
        )}
        {officer.room && <p className="text-gray-600">Room no: {officer.room}</p>}
      </div>
    </div>
  );
}

export default async function ServiceCharterPage() {
  const [charter, hero] = await Promise.all([
    getServiceCharter(),
    getPageHero('student-society-service-charter'),
  ]);

  const items = charter?.items ?? [];

  return (
    <PageShell
      title={hero?.heroTitle ?? 'Service Charter'}
      subtitle={hero?.heroSubtitle ?? undefined}
      overline={hero?.heroOverline ?? 'Student Society'}
      image={hero?.heroImageUrl || null}
      imagePosition={hero ? `center ${hero.heroImageVerticalPercent}%` : undefined}
      contentClassName="bg-gray-50 py-12 md:py-16"
    >
      <Container>
        {charter?.intro && (
          <p className="mx-auto mb-10 max-w-3xl text-center text-[15px] leading-relaxed text-gray-600 md:mb-14">
            {charter.intro}
          </p>
        )}

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">Service charter will be updated soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => {
              // Officer phone numbers are deliberately not shown on this
              // page — students should reach the office by e-mail or in
              // person. The numbers stay in the database (and remain
              // editable in the CMS) so they can be surfaced again by
              // passing the phone fields through here.
              const officers: Officer[] = [
                {
                  name: item.responsibleName,
                  role: item.responsibleRole,
                  phone: null,
                  email: item.responsibleEmail,
                  room: item.responsibleRoom,
                },
                {
                  name: item.responsible2Name,
                  role: item.responsible2Role,
                  phone: null,
                  email: item.responsible2Email,
                  room: item.responsible2Room,
                },
              ].filter((o) => o.name);

              return (
                <article
                  key={item.id}
                  className="flex flex-col rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <header className="mb-4 flex items-start gap-3">
                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <h2 className="font-display text-[15px] font-bold leading-snug text-primary">
                      {item.title}
                    </h2>
                  </header>

                  {/* A single step reads as an instruction, so it gets an
                      arrow; two or more are a sequence, so they get
                      numbers — matching how the source document reads. */}
                  {item.steps.length > 0 && (
                    <div className="mb-5 flex-1">
                      {item.steps.length === 1 ? (
                        <div className="flex gap-3">
                          <ArrowRight size={15} className="mt-1 shrink-0 text-accent" />
                          <p className="text-[14px] leading-relaxed text-gray-700">
                            <Linkify text={item.steps[0]} />
                          </p>
                        </div>
                      ) : (
                        <ol className="space-y-3">
                          {item.steps.map((step, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-bold text-accent">
                                {i + 1}
                              </span>
                              <p className="text-[14px] leading-relaxed text-gray-700">
                                <Linkify text={step} />
                              </p>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}

                  {officers.length > 0 && (
                    <div className="mt-auto space-y-3 border-t border-gray-100 pt-4">
                      {officers.map((o, i) => (
                        <OfficerBlock key={i} officer={o} />
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {/* ── Downloadable charter ── hidden until a PDF is attached. */}
        {charter?.pdfUrl && (
          <section className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:mt-14 md:p-8">
            <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-md">
                  <FileText size={20} strokeWidth={1.75} />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold text-primary">
                    {charter.pdfHeading}
                  </h2>
                  {charter.pdfSubtitle && (
                    <p className="mt-1 text-[14px] leading-relaxed text-gray-600">
                      {charter.pdfSubtitle}
                    </p>
                  )}
                </div>
              </div>
              <a
                href={charter.pdfUrl}
                download={charter.pdfFileName ?? undefined}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-primary/90"
              >
                <Download size={16} />
                Download PDF
              </a>
            </div>
          </section>
        )}
      </Container>
    </PageShell>
  );
}
