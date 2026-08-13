'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import {
  departmentLayoutUpdateSchema,
  departmentLayoutOfficesSchema,
} from '@/lib/validation';

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

/**
 * Offices arrive as parallel indexed fields — officeName.0, level.0,
 * building.0, highlighted.0, … — so the admin can add, remove and
 * reorder rows without hand-editing JSON. Rows with no office name are
 * dropped, which is how a blank row left behind gets discarded.
 */
function readOffices(formData: FormData) {
  const indices = new Set<number>();
  for (const key of formData.keys()) {
    const m = key.match(/^officeName\.(\d+)$/);
    if (m) indices.add(Number(m[1]));
  }

  const out: {
    officeName: string;
    level: string;
    building: string | null;
    isHighlighted: boolean;
  }[] = [];

  for (const i of [...indices].sort((a, b) => a - b)) {
    const officeName = getStr(formData, `officeName.${i}`);
    if (!officeName) continue;
    out.push({
      officeName,
      level: getStr(formData, `level.${i}`),
      building: emptyToNull(formData.get(`building.${i}`)),
      // Unchecked boxes are simply absent from the payload.
      isHighlighted: formData.get(`highlighted.${i}`) === 'on',
    });
  }
  return out;
}

export async function updateDepartmentLayoutAction(
  _prev: ActionResult | { ok: null },
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: 'Not authenticated' };

  const chrome = departmentLayoutUpdateSchema.safeParse({
    universityName:      getStr(formData, 'universityName'),
    departmentName:      getStr(formData, 'departmentName'),
    addressLine:         emptyToNull(formData.get('addressLine')),
    officeColumnLabel:   getStr(formData, 'officeColumnLabel'),
    locationColumnLabel: getStr(formData, 'locationColumnLabel'),
    downloadHeading:     getStr(formData, 'downloadHeading'),
    downloadSubtitle:    emptyToNull(formData.get('downloadSubtitle')),
    documentTitle:       getStr(formData, 'documentTitle'),
    coverUrl:            emptyToNull(formData.get('coverUrl')),
    coverPublicId:       emptyToNull(formData.get('coverPublicId')),
    pdfUrl:              emptyToNull(formData.get('pdfUrl')),
    pdfPublicId:         emptyToNull(formData.get('pdfPublicId')),
    pdfFileName:         emptyToNull(formData.get('pdfFileName')),
  });
  if (!chrome.success) {
    return {
      ok: false,
      error: chrome.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; '),
    };
  }

  const offices = departmentLayoutOfficesSchema.safeParse(readOffices(formData));
  if (!offices.success) {
    return {
      ok: false,
      error: offices.error.issues
        .map((i) => `office ${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; '),
    };
  }

  try {
    // The row set is replaced wholesale in one transaction: reordering
    // or deleting rows individually would otherwise need per-row diffing.
    await prisma.$transaction([
      prisma.departmentLayout.upsert({
        where: { id: 'singleton' },
        create: { id: 'singleton', ...chrome.data },
        update: chrome.data,
      }),
      prisma.departmentLayoutOffice.deleteMany({ where: { layoutId: 'singleton' } }),
      ...(offices.data.length
        ? [
            prisma.departmentLayoutOffice.createMany({
              data: offices.data.map((o, index) => ({
                ...o,
                layoutId: 'singleton',
                displayOrder: index,
              })),
            }),
          ]
        : []),
    ]);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }

  revalidatePath('/about/department-layout');
  revalidatePath('/admin/department-layout');
  revalidatePath('/', 'layout');
  return { ok: true };
}
