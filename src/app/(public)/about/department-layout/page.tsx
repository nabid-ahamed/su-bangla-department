import { ImageIcon, ExternalLink, Download } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Container from '@/components/ui/Container';
import { getDepartmentLayout, getPageHero } from '@/lib/identity';

export const revalidate = 3600;

export const metadata = {
  title: 'Department Layout',
  description:
    'Office directory and layout plan for the Department of Bangla, Sonargaon University.',
};

export default async function DepartmentLayoutPage() {
  const [layout, hero] = await Promise.all([
    getDepartmentLayout(),
    getPageHero('about-department-layout'),
  ]);

  // `|| null` rather than `?? null`: the hero row is seeded before its
  // artwork exists, and an empty heroImageUrl would render a broken
  // <img>. Falsy means "no image", so PageShell paints the gradient.
  return (
    <PageShell
      title={hero?.heroTitle ?? 'Department Layout'}
      subtitle={hero?.heroSubtitle ?? undefined}
      overline={hero?.heroOverline ?? 'About'}
      image={hero?.heroImageUrl || null}
      imagePosition={hero ? `center ${hero.heroImageVerticalPercent}%` : undefined}
      contentClassName="bg-gray-50 py-12 md:py-16"
    >
      <Container>
        {!layout ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">Layout information will be updated soon.</p>
          </div>
        ) : (
          <>
            {/* ── Office directory ── */}
            <section className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <header className="px-6 py-8 text-center md:px-10">
                <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
                  {layout.universityName}
                </h2>
                <p className="mt-2 text-[15px] text-gray-700 md:text-base">
                  {layout.departmentName}
                </p>
                {layout.addressLine && (
                  <p className="mt-1 text-[13px] text-gray-500">{layout.addressLine}</p>
                )}
              </header>

              {layout.offices.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[36rem] border-collapse text-left">
                    <thead>
                      <tr className="border-y border-gray-100 bg-gray-50/80">
                        <th
                          scope="col"
                          className="px-6 py-4 text-[13px] font-bold text-primary md:text-sm"
                        >
                          {layout.officeColumnLabel}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-[13px] font-bold text-primary md:text-sm"
                        >
                          {layout.locationColumnLabel}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {layout.offices.map((office) => (
                        <tr
                          key={office.id}
                          className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/60"
                        >
                          <td
                            className={`px-6 py-4 align-top text-[14px] md:text-[15px] ${
                              office.isHighlighted
                                ? 'font-bold text-primary'
                                : 'text-gray-700'
                            }`}
                          >
                            {office.officeName}
                          </td>
                          <td className="px-6 py-4 align-top">
                            <span className="block text-[14px] text-gray-700 md:text-[15px]">
                              {office.level}
                            </span>
                            {office.building && (
                              <span className="mt-0.5 block text-[13px] text-gray-500">
                                Building: {office.building}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ── Downloadable plan ── only when a PDF is attached. */}
            {layout.pdfUrl && (
              <section className="mt-14 md:mt-20">
                <h2 className="text-center font-display text-xl font-bold text-primary md:text-2xl">
                  {layout.downloadHeading}
                </h2>
                {layout.downloadSubtitle && (
                  <p className="mx-auto mt-2 max-w-2xl text-center text-[15px] text-gray-600">
                    {layout.downloadSubtitle}
                  </p>
                )}

                <div className="mx-auto mt-8 flex w-full max-w-md flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                  {/* The cover renders at its own aspect ratio (w-full
                      h-auto) rather than being cropped to a fixed box —
                      a layout plan is a document, so cropping it would
                      cut off the very content people came to see. The
                      placeholder keeps a 3:4 box only while empty. */}
                  {layout.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={layout.coverUrl}
                      alt={layout.documentTitle}
                      className="block h-auto w-full"
                    />
                  ) : (
                    <div className="flex aspect-[3/4] items-center justify-center bg-gray-50">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <ImageIcon size={32} strokeWidth={1.5} />
                        <span className="text-[13px]">Cover image coming soon</span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 p-5">
                    <h3 className="font-display text-lg font-bold text-primary">
                      {layout.documentTitle}
                    </h3>
                    <div className="mt-4 flex flex-col gap-3">
                      <a
                        href={layout.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-[14px] font-bold text-white transition-colors hover:bg-primary/90"
                      >
                        <ExternalLink size={16} />
                        View Layout
                      </a>
                      {/* `download` gives the saved file a readable name
                          instead of the Cloudinary public id. */}
                      <a
                        href={layout.pdfUrl}
                        download={layout.pdfFileName ?? undefined}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary/70 px-5 py-3 text-[14px] font-bold text-primary transition-colors hover:bg-primary/5"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </Container>
    </PageShell>
  );
}
