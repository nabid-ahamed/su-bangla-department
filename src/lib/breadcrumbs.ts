/**
 * Breadcrumb structure for the public site.
 *
 * Breadcrumbs used to be derived purely from URL segments, which produced
 * three wrong results:
 *
 *   1. Grouping segments (/about, /admission, /student-society) were
 *      rendered as links, but they have no page and returned 404.
 *   2. Labels were guessed by title-casing the slug, so `/about/cultural-club`
 *      read "Cultural Club" and `/programs/ba-in-bangla` read "Ba In Bangla".
 *   3. A page's URL parent is not always its *menu* parent — the Bangla
 *      Literature & Cultural Club lives at /about/cultural-club but is listed
 *      under Student Society, so the trail pointed at the wrong section.
 *
 * The trail is now declared here, matching the navigation the visitor
 * actually used to arrive. Anything not listed still falls back to the old
 * segment-splitting behaviour, so new routes keep working before someone
 * adds them.
 */

export type Crumb = {
  label: string;
  /** Omitted for grouping levels that have no page of their own. */
  href?: string;
};

/** Dropdown groups in the main nav. These are menu headings, not pages. */
const SECTION_ABOUT = 'About';
const SECTION_ADMISSION = 'Admission';
const SECTION_STUDENT_SOCIETY = 'Student Society';

/**
 * Trail for each public route, excluding the leading Home crumb and the
 * page itself — those are added by the renderer. Labels match the main
 * navigation wording so the trail reads the way the menu does.
 */
const ROUTES: Record<string, { parents: Crumb[]; label: string }> = {
  // About
  '/about/overview':          { parents: [{ label: SECTION_ABOUT }], label: 'Department Overview' },
  '/about/message-from-head': { parents: [{ label: SECTION_ABOUT }], label: 'Message from Head' },
  '/about/deans-message':     { parents: [{ label: SECTION_ABOUT }], label: "Dean's Message" },
  '/about/mission-vision':    { parents: [{ label: SECTION_ABOUT }], label: 'Mission & Vision' },
  '/about/department-layout': { parents: [{ label: SECTION_ABOUT }], label: 'Department Layout' },

  // Admission
  '/admission/requirements':        { parents: [{ label: SECTION_ADMISSION }], label: 'Admission Requirements' },
  '/admission/tuition-fees':        { parents: [{ label: SECTION_ADMISSION }], label: 'Tuition Fees' },
  '/admission/transfer-credits':    { parents: [{ label: SECTION_ADMISSION }], label: 'Transfer Credits' },
  '/admission/waiver-scholarship':  { parents: [{ label: SECTION_ADMISSION }], label: 'Waiver & Scholarship' },
  '/admission/notice':              { parents: [{ label: SECTION_ADMISSION }], label: 'Admission Notice' },
  '/admission/prospectus':          { parents: [{ label: SECTION_ADMISSION }], label: 'Prospectus' },

  // Student Society
  '/student-society/notice-board':    { parents: [{ label: SECTION_STUDENT_SOCIETY }], label: 'Notice Board' },
  '/student-society/events':          { parents: [{ label: SECTION_STUDENT_SOCIETY }], label: 'Events' },
  '/student-society/alumni':          { parents: [{ label: SECTION_STUDENT_SOCIETY }], label: 'Alumni' },
  '/student-society/visitor':         { parents: [{ label: SECTION_STUDENT_SOCIETY }], label: 'Visitor' },
  '/student-society/faq':             { parents: [{ label: SECTION_STUDENT_SOCIETY }], label: 'FAQs' },
  '/student-society/syllabus':        { parents: [{ label: SECTION_STUDENT_SOCIETY }], label: 'Syllabus' },
  '/student-society/club-list':       { parents: [{ label: SECTION_STUDENT_SOCIETY }], label: 'Club list' },
  '/student-society/service-charter': { parents: [{ label: SECTION_STUDENT_SOCIETY }], label: 'Service Charter' },

  // Listed under Student Society in the menu even though the URL sits
  // under /about — the trail follows the menu, not the path.
  '/about/cultural-club': {
    parents: [{ label: SECTION_STUDENT_SOCIETY }],
    label: 'Bangla Literature & Cultural Club',
  },

  // Top-level pages
  '/faculty-member':       { parents: [], label: 'Faculty Member' },
  '/contact':              { parents: [], label: 'Contact' },
  '/gallery':              { parents: [], label: 'Gallery' },
  '/news':                 { parents: [], label: 'News' },
  '/newsletter':           { parents: [], label: 'Newsletter' },
  '/research':             { parents: [], label: 'Research' },
  '/transport-service':    { parents: [], label: 'Transport Service' },
  '/privacy-policy':       { parents: [], label: 'Privacy Policy' },
  '/terms-and-conditions': { parents: [], label: 'Terms & Conditions' },
};

/**
 * Detail routes whose final crumb is the record's own title, which the
 * page passes in. The parent listing page is linked so the visitor can
 * get back to it.
 */
const DETAIL_PARENTS: Record<string, Crumb[]> = {
  // Programmes are reached from the homepage Programs section; there is no
  // programme listing page, so the trail goes straight back to Home.
  '/programs':               [{ label: 'Programs' }],
  '/news':                   [{ label: 'News', href: '/news' }],
  '/faculty-member':         [{ label: 'Faculty Member', href: '/faculty-member' }],
  '/student-society/events': [{ label: SECTION_STUDENT_SOCIETY }, { label: 'Events', href: '/student-society/events' }],
};

/** URL prefixes that group pages in the menu but have no page of their own. */
const GROUPING_SEGMENTS = new Set(['/about', '/admission', '/student-society', '/programs']);

const titleCase = (slug: string) =>
  slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/**
 * Build the crumb trail for a pathname, excluding the leading Home crumb.
 *
 * `currentLabel` overrides the final crumb — detail pages pass the record's
 * real title (an article headline, a programme name) since it can't be
 * derived from the slug.
 */
export function getBreadcrumbs(pathname: string, currentLabel?: string): Crumb[] {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/') return [];

  const known = ROUTES[clean];
  if (known) return [...known.parents, { label: currentLabel ?? known.label }];

  // Detail route: everything above the last segment is the listing page.
  const lastSlash = clean.lastIndexOf('/');
  const parentPath = clean.slice(0, lastSlash);
  const slug = clean.slice(lastSlash + 1);
  const detailParents = DETAIL_PARENTS[parentPath];
  if (detailParents) {
    return [...detailParents, { label: currentLabel ?? titleCase(slug) }];
  }

  // Unknown route — fall back to segment splitting, but never link a
  // known grouping segment, since those have no page behind them.
  const segments = clean.split('/').filter(Boolean);
  return segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const isLast = i === segments.length - 1;
    return {
      label: isLast && currentLabel ? currentLabel : titleCase(seg),
      href: isLast || GROUPING_SEGMENTS.has(href) ? undefined : href,
    };
  });
}
