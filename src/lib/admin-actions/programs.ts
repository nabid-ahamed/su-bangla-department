'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { programCreateSchema, programUpdateSchema } from '@/lib/validation';

export type ActionResult = { ok: true } | { ok: false; error: string };

function getStr(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === 'string' ? v.trim() : '';
}

function emptyToNull(v: FormDataEntryValue | null): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function splitLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function requireAuth(): Promise<ActionResult | null> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: 'Not authenticated' };
  return null;
}

/**
 * Create and update read the same fields, so the shape lives here
 * once — a field added to the form only has to be wired in one place.
 */
function readProgramRow(formData: FormData) {
  return {
    programName:     getStr(formData, 'programName'),
    degreeCode:      getStr(formData, 'degreeCode'),
    duration:        getStr(formData, 'duration'),
    description:     getStr(formData, 'description'),
    specializations: splitLines(getStr(formData, 'specializations')),
    cta:             emptyToNull(formData.get('cta')),
    ctaHref:         emptyToNull(formData.get('ctaHref')),
    imageUrl:        emptyToNull(formData.get('imageUrl')),
    imagePublicId:   emptyToNull(formData.get('imagePublicId')),

    // Detail page. A blank slug stores NULL rather than '' so the
    // unique index stays satisfied across several slug-less programs.
    slug:            emptyToNull(formData.get('slug')),
    overview:        emptyToNull(formData.get('overview')),
    totalCredits:    emptyToNull(formData.get('totalCredits')),
    semesterFormat:  emptyToNull(formData.get('semesterFormat')),
    semesterFormatLabel: emptyToNull(formData.get('semesterFormatLabel')),
    degreeAwarded:   emptyToNull(formData.get('degreeAwarded')),
    admissionFee:    emptyToNull(formData.get('admissionFee')),
    semesterFee:     emptyToNull(formData.get('semesterFee')),
    careerIntro:     emptyToNull(formData.get('careerIntro')),
    careerItems:     splitLines(getStr(formData, 'careerItems')),
    careerClosing:   emptyToNull(formData.get('careerClosing')),
  };
}

export async function createProgramAction(
  _prev: ActionResult | { ok: null },
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;

  const parsed = programCreateSchema.safeParse(readProgramRow(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; '),
    };
  }

  // Auto-append displayOrder (max + 1)
  const last = await prisma.program.findFirst({
    orderBy: { displayOrder: 'desc' },
    select: { displayOrder: true },
  });
  const displayOrder = (last?.displayOrder ?? -1) + 1;

  try {
    await prisma.program.create({
      data: {
        programName:     parsed.data.programName,
        degreeCode:      parsed.data.degreeCode,
        duration:        parsed.data.duration,
        description:     parsed.data.description,
        displayOrder,
        imageUrl:        parsed.data.imageUrl ?? null,
        imagePublicId:   parsed.data.imagePublicId ?? null,
        specializations: parsed.data.specializations,
        cta:             parsed.data.cta ?? null,
        ctaHref:         parsed.data.ctaHref ?? null,
        slug:            parsed.data.slug ?? null,
        overview:        parsed.data.overview ?? null,
        totalCredits:    parsed.data.totalCredits ?? null,
        semesterFormat:  parsed.data.semesterFormat ?? null,
        semesterFormatLabel: parsed.data.semesterFormatLabel ?? null,
        degreeAwarded:   parsed.data.degreeAwarded ?? null,
        admissionFee:    parsed.data.admissionFee ?? null,
        semesterFee:     parsed.data.semesterFee ?? null,
        careerIntro:     parsed.data.careerIntro ?? null,
        careerItems:     parsed.data.careerItems,
        careerClosing:   parsed.data.careerClosing ?? null,
      },
    });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2002') {
      // Both degreeCode and slug are unique — name the offending one
      // so the admin knows which field to change.
      const target = (e as { meta?: { target?: string[] | string } })?.meta?.target;
      const field = Array.isArray(target) ? target.join(', ') : String(target ?? 'degreeCode');
      return { ok: false, error: `${field.includes('slug') ? 'slug' : 'degreeCode'} is already in use` };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }

  revalidatePath('/admin/programs');
  revalidatePath('/admin');
  // Public surface: homepage Programs section. Note this must run
  // BEFORE redirect() — redirect() throws and anything after is
  // unreachable.
  revalidatePath('/');
  redirect('/admin/programs');
}

export async function updateProgramAction(
  id: string,
  _prev: ActionResult | { ok: null },
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;

  const parsed = programUpdateSchema.safeParse(readProgramRow(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; '),
    };
  }

  try {
    await prisma.program.update({
      where: { id },
      data: parsed.data,
    });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === 'P2025') return { ok: false, error: 'Program not found' };
    if (code === 'P2002') {
      const target = (e as { meta?: { target?: string[] | string } })?.meta?.target;
      const field = Array.isArray(target) ? target.join(', ') : String(target ?? '');
      return { ok: false, error: `${field.includes('slug') ? 'slug' : 'degreeCode'} already in use` };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }

  revalidatePath('/admin/programs');
  revalidatePath(`/admin/programs/${id}`);
  revalidatePath('/admin');
  revalidatePath('/');
  if (parsed.data.slug) revalidatePath(`/programs/${parsed.data.slug}`);
  return { ok: true };
}

export async function deleteProgramAction(id: string): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;

  try {
    await prisma.program.delete({ where: { id } });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2025') {
      return { ok: false, error: 'Program not found' };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }
  revalidatePath('/admin/programs');
  revalidatePath('/admin');
  revalidatePath('/');
  return { ok: true };
}

export async function reorderProgramsAction(ids: string[]): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;

  const existing = await prisma.program.findMany({ select: { id: true } });
  const existingIds = new Set(existing.map((p) => p.id));
  if (ids.length !== existingIds.size || !ids.every((id) => existingIds.has(id))) {
    return { ok: false, error: 'Reorder list must include exactly the existing programs' };
  }

  try {
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.program.update({ where: { id }, data: { displayOrder: index } }),
      ),
    );
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }
  revalidatePath('/admin/programs');
  revalidatePath('/');
  return { ok: true };
}
