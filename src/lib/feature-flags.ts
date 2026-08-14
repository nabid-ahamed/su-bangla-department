/**
 * Temporary on/off switches for public pages.
 *
 * These exist so a page can be taken down for a while without deleting its
 * route, its data, or its admin screens. Flip the flag back to `true` and
 * the page returns exactly as it was.
 */

/**
 * The public syllabus page at /student-society/syllabus.
 *
 * Turned off on request (14 Aug 2026) until the department is ready to
 * publish it. While this is `false`:
 *   - the page returns 404 instead of rendering,
 *   - it is dropped from the sitemap and the site search index,
 *   - the "Syllabus" nav entry is greyed out (its own `isDisabled` flag
 *     in the main_nav_item table, editable from the CMS).
 *
 * To bring it back: set this to `true` and clear `isDisabled` on the
 * Syllabus nav item in the admin Navigation screen.
 */
export const SYLLABUS_PAGE_ENABLED = false;
