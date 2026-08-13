'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAuth(): Promise<ActionResult | null> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: 'Not authenticated' };
  return null;
}

/**
 * The curriculum is edited as a whole table rather than row-by-row:
 * an admin reordering semesters or fixing a batch of credits would
 * otherwise fire dozens of separate writes. The form posts every row
 * as indexed fields (semesterLabel.N, courseCode.N, …); we replace
 * the program's course list in one transaction.
 *
 * Rows are grouped into semesters by their label, in first-appearance
 * order — that ordering is what the public page groups and sorts by.
 */
export async function saveProgramCoursesAction(
  programId: string,
  _prev: ActionResult | { ok: null },
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;

  const program = await prisma.program.findUnique({
    where: { id: programId },
    select: { id: true, slug: true },
  });
  if (!program) return { ok: false, error: 'Program not found' };

  const indices = new Set<number>();
  for (const key of formData.keys()) {
    const m = key.match(/^courseTitle\.(\d+)$/);
    if (m) indices.add(Number(m[1]));
  }

  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === 'string' ? v.trim() : '';
  };

  const semesterOrderByLabel = new Map<string, number>();
  const rows: {
    programId: string;
    semesterLabel: string;
    semesterOrder: number;
    courseCode: string;
    courseTitle: string;
    credits: number;
    courseType: string;
    prerequisite: string | null;
    displayOrder: number;
  }[] = [];

  for (const i of [...indices].sort((a, b) => a - b)) {
    const courseTitle = str(`courseTitle.${i}`);
    const semesterLabel = str(`semesterLabel.${i}`);
    // A row with no title is a blank the admin left behind; a row with
    // no semester has nowhere to render, so both are dropped.
    if (!courseTitle || !semesterLabel) continue;

    const creditsRaw = str(`credits.${i}`);
    const credits = Number(creditsRaw);
    if (!Number.isFinite(credits) || credits < 0) {
      return { ok: false, error: `"${courseTitle}": credits must be a number (got "${creditsRaw}")` };
    }

    if (!semesterOrderByLabel.has(semesterLabel)) {
      semesterOrderByLabel.set(semesterLabel, semesterOrderByLabel.size);
    }

    const prerequisite = str(`prerequisite.${i}`);
    rows.push({
      programId,
      semesterLabel,
      semesterOrder: semesterOrderByLabel.get(semesterLabel)!,
      courseCode: str(`courseCode.${i}`),
      courseTitle,
      credits,
      courseType: str(`courseType.${i}`) || 'Core',
      prerequisite: prerequisite && prerequisite !== 'N/A' ? prerequisite : null,
      displayOrder: rows.length,
    });
  }

  try {
    await prisma.$transaction([
      prisma.programCourse.deleteMany({ where: { programId } }),
      ...(rows.length ? [prisma.programCourse.createMany({ data: rows })] : []),
    ]);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }

  revalidatePath(`/admin/programs/${programId}/courses`);
  revalidatePath('/admin/programs');
  if (program.slug) revalidatePath(`/programs/${program.slug}`);
  return { ok: true };
}
