import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Clock,
  BookOpen,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  FileText,
  Wallet,
} from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Container from '@/components/ui/Container';
import { getProgramBySlug, getProgramSlugs } from '@/lib/identity';
import CourseStructure, { type Semester } from './CourseStructure';

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getProgramSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: 'Program not found' };
  return {
    title: headingOf(program.programName),
    description: (program.overview ?? program.description).slice(0, 160),
  };
}

// Home cards store programName as "<overline> — <heading>"; the
// detail page splits it back apart — the overline rides above the
// hero title, the heading is the page's subject.
const PROGRAM_NAME_SEP = ' — ';
function headingOf(programName: string) {
  const parts = programName.split(PROGRAM_NAME_SEP);
  return parts.length > 1 ? parts.slice(1).join(PROGRAM_NAME_SEP) : programName;
}
function overlineOf(programName: string) {
  const parts = programName.split(PROGRAM_NAME_SEP);
  return parts.length > 1 ? parts[0] : null;
}

const fmt = (n: number) => String(n);

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const heading = headingOf(program.programName);
  const overline = overlineOf(program.programName);

  // Group the flat course list into semesters. The query already
  // returns them in order, so a plain sequential walk preserves both
  // semester order and course order within each.
  const semesters: Semester[] = [];
  let currentOrder: number | null = null;
  for (const c of program.courses) {
    if (c.semesterOrder !== currentOrder) {
      currentOrder = c.semesterOrder;
      semesters.push({ label: c.semesterLabel, courses: [], credits: 0 });
    }
    const sem = semesters[semesters.length - 1];
    sem.courses.push(c);
    sem.credits += c.credits;
  }

  const totalCourses = program.courses.length;
  const computedCredits = program.courses.reduce((sum, c) => sum + c.credits, 0);

  // The stat strip wants short values — a long one wraps and makes its
  // card taller than its neighbours. Duration is omitted here because
  // it already sits in the pill under the overview, and degreeAwarded
  // (kept for metadata) would just repeat the page title.
  const stats = [
    { icon: BookOpen, label: 'Credit', value: program.totalCredits },
    {
      icon: CalendarDays,
      label: program.semesterFormatLabel || 'Semester Format',
      value: program.semesterFormat,
    },
    { icon: CreditCard, label: 'Admission Fee', value: program.admissionFee },
    { icon: Wallet, label: 'Semester Fee', value: program.semesterFee },
  ].filter((s): s is { icon: typeof BookOpen; label: string; value: string } => Boolean(s.value));

  const hasCareers =
    Boolean(program.careerIntro) ||
    program.careerItems.length > 0 ||
    Boolean(program.careerClosing);

  const paragraphs = (text: string) =>
    text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <PageShell
      title={heading}
      overline={overline ?? 'Programs'}
      breadcrumbLabel={heading}
      image={program.imageUrl}
      contentClassName="bg-gray-50 py-12 md:py-20"
    >
      <Container>
        {/* ── Program overview ── */}
        <section className="mb-14 md:mb-20 mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-[1.5px] w-10 bg-accent/40" />
            <span className="text-accent text-[10px] font-bold uppercase tracking-[0.2em]">
              Program Overview
            </span>
            <span className="h-[1.5px] w-10 bg-accent/40" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight mb-5">
            {heading}
          </h2>
          <div className="space-y-5 text-[15px] md:text-[16px] leading-[1.85] text-gray-800">
            {paragraphs(program.overview ?? program.description).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {program.duration && (
            <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-2">
              <Clock size={16} className="text-accent" />
              <span className="text-[13px] font-semibold text-primary">{program.duration}</span>
            </div>
          )}
        </section>

        {/* ── At a Glance ── */}
        {stats.length > 0 && (
          <section className="mb-14 md:mb-20">
            <h2 className="mb-8 text-center font-display text-xl font-bold text-primary md:text-2xl">
              At a Glance
            </h2>
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center rounded-xl border border-gray-100 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white shadow-md">
                    <Icon size={20} strokeWidth={1.75} />
                  </div>
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {label}
                  </div>
                  {/* mt-auto pins the value to the bottom, so a card whose
                      label or value wraps still lines up with its neighbours. */}
                  <div className="mt-auto font-display text-lg font-bold leading-tight text-primary md:text-xl">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Specializations ── */}
        {program.specializations.length > 0 && (
          <section className="mx-auto mb-14 max-w-6xl md:mb-20">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
              <h2 className="mb-6 text-center font-display text-xl font-bold text-primary md:text-2xl">
                Specializations
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {program.specializations.map((spec) => (
                  <div
                    key={spec}
                    className="flex items-center gap-3 rounded-lg bg-primary/5 px-4 py-3"
                  >
                    <CheckCircle2 size={18} className="shrink-0 text-accent" />
                    <span className="text-[15px] font-semibold text-primary">{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Career Prospects ── omitted until the copy is supplied. */}
        {hasCareers && (
          <section className="mx-auto mb-14 max-w-6xl md:mb-20">
            <h2 className="mb-6 text-center font-display text-xl font-bold text-primary md:text-2xl">
              Career Prospects
            </h2>
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
              <div className="mx-auto flex max-w-3xl flex-col gap-5">
                {program.careerIntro &&
                  paragraphs(program.careerIntro).map((para, i) => (
                    <p key={i} className="text-[15px] leading-[1.85] text-gray-700">
                      {para}
                    </p>
                  ))}

                {program.careerItems.length > 0 && (
                  <ul className="flex flex-col gap-2.5">
                    {program.careerItems.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent"
                        />
                        <span className="text-[15px] leading-[1.85] text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {program.careerClosing &&
                  paragraphs(program.careerClosing).map((para, i) => (
                    <p key={i} className="text-[15px] leading-[1.85] text-gray-700">
                      {para}
                    </p>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Course Structure ── */}
        {semesters.length > 0 && (
          <section className="mb-14 md:mb-20">
            <h2 className="mb-2 text-center font-display text-xl font-bold text-primary md:text-2xl">
              Course Structure
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-center text-[15px] text-gray-600">
              {totalCourses} courses across {semesters.length} semesters. Select a semester to see
              its courses.
            </p>
            <CourseStructure semesters={semesters} />
          </section>
        )}

        {/* ── Credit Distribution ── */}
        {semesters.length > 0 && (
          <section className="mx-auto mb-14 max-w-6xl md:mb-20">
            <h2 className="mb-6 text-center font-display text-xl font-bold text-primary md:text-2xl">
              Credit Distribution
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full min-w-[34rem] text-left text-[14px]">
                <caption className="sr-only">
                  Credits per semester with a running cumulative total
                </caption>
                <thead>
                  <tr className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                    <th scope="col" className="px-5 py-3">Semester</th>
                    <th scope="col" className="px-5 py-3 text-right">Courses</th>
                    <th scope="col" className="px-5 py-3 text-right">Credits</th>
                    <th scope="col" className="px-5 py-3 text-right">Cumulative</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let running = 0;
                    return semesters.map((s) => {
                      running += s.credits;
                      return (
                        <tr key={s.label} className="border-t border-gray-100">
                          <td className="px-5 py-3 font-medium text-gray-800">{s.label}</td>
                          <td className="px-5 py-3 text-right tabular-nums text-gray-600">
                            {s.courses.length}
                          </td>
                          <td className="px-5 py-3 text-right font-bold tabular-nums text-primary">
                            {fmt(s.credits)}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold tabular-nums text-gray-700">
                            {fmt(running)}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td className="px-5 py-3 font-bold text-primary">Total</td>
                    <td className="px-5 py-3 text-right font-bold tabular-nums text-primary">
                      {totalCourses}
                    </td>
                    <td
                      className="px-5 py-3 text-right font-bold tabular-nums text-primary"
                      colSpan={2}
                    >
                      {fmt(computedCredits)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-primary p-8 text-center shadow-2xl md:p-12">
            <h2 className="mb-4 font-display text-2xl font-bold text-white md:text-3xl">
              Ready to Apply?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-[15px] leading-relaxed text-white/80">
              Take the next step toward your career in {heading}. Review the admission requirements
              or explore the tuition fee structure.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/admission/requirements"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-button-yellow px-8 py-3.5 font-bold text-primary shadow-md transition-colors hover:bg-button-yellow/90"
              >
                <FileText size={18} />
                View Requirements
              </Link>
              <Link
                href="/admission/tuition-fees"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-8 py-3.5 font-bold text-white transition-colors hover:bg-white/10"
              >
                <Wallet size={18} />
                Tuition Fees
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </PageShell>
  );
}
