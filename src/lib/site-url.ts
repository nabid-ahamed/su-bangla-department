/**
 * Absolute origin for this deployment.
 *
 * Used by metadataBase (OG/Twitter image URLs, canonical links),
 * sitemap.xml, and robots.txt — anywhere a fully-qualified URL has to
 * be emitted rather than a relative path.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL — set this in Vercel once a custom domain
 *      is attached, so metadata points at the canonical host.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — injected by Vercel; the
 *      project's production hostname (no protocol).
 *   3. localhost — dev fallback.
 *
 * Previously each of these files hardcoded the old ME project's
 * vercel.app domain, which made every social preview fetch assets
 * from a stale deployment.
 */
export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');
