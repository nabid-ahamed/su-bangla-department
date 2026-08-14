'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import {
  serviceCharterUpdateSchema,
  serviceCharterItemsSchema,
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
 * Services arrive as parallel indexed fields — title.0, steps.0,
 * responsibleName.0, … — so rows can be added, removed and reordered
 * without hand-editing JSON. `steps.N` is a textarea, one step per
 * line, because a step is always plain prose.
 */
function readItems(formData: FormData) {
  const indices = new Set<number>();
  for (const key of formData.keys()) {
    const m = key.match(/^title\.(\d+)$/);
    if (m) indices.add(Number(m[1]));
  }

  const out = [];
  for (const i of [...indices].sort((a, b) => a - b)) {
    const title = getStr(formData, `title.${i}`);
    if (!title) continue;
    out.push({
      title,
      steps: getStr(formData, `steps.${i}`)
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
      responsibleName:   emptyToNull(formData.get(`responsibleName.${i}`)),
      responsibleRole:   emptyToNull(formData.get(`responsibleRole.${i}`)),
      responsiblePhone:  emptyToNull(formData.get(`responsiblePhone.${i}`)),
      responsibleEmail:  emptyToNull(formData.get(`responsibleEmail.${i}`)),
      responsibleRoom:   emptyToNull(formData.get(`responsibleRoom.${i}`)),
      responsible2Name:  emptyToNull(formData.get(`responsible2Name.${i}`)),
      responsible2Role:  emptyToNull(formData.get(`responsible2Role.${i}`)),
      responsible2Phone: emptyToNull(formData.get(`responsible2Phone.${i}`)),
      responsible2Email: emptyToNull(formData.get(`responsible2Email.${i}`)),
      responsible2Room:  emptyToNull(formData.get(`responsible2Room.${i}`)),
    });
  }
  return out;
}

export async function updateServiceCharterAction(
  _prev: ActionResult | { ok: null },
  formData: FormData,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: 'Not authenticated' };

  const chrome = serviceCharterUpdateSchema.safeParse({
    intro:       emptyToNull(formData.get('intro')),
    pdfHeading:  getStr(formData, 'pdfHeading'),
    pdfSubtitle: emptyToNull(formData.get('pdfSubtitle')),
    pdfUrl:      emptyToNull(formData.get('pdfUrl')),
    pdfPublicId: emptyToNull(formData.get('pdfPublicId')),
    pdfFileName: emptyToNull(formData.get('pdfFileName')),
  });
  if (!chrome.success) {
    return {
      ok: false,
      error: chrome.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; '),
    };
  }

  const items = serviceCharterItemsSchema.safeParse(readItems(formData));
  if (!items.success) {
    return {
      ok: false,
      error: items.error.issues
        .map((i) => `service ${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; '),
    };
  }

  try {
    // Replaced wholesale in one transaction — reordering or deleting
    // rows individually would otherwise need per-row diffing.
    await prisma.$transaction([
      prisma.serviceCharter.upsert({
        where: { id: 'singleton' },
        create: { id: 'singleton', ...chrome.data },
        update: chrome.data,
      }),
      prisma.serviceCharterItem.deleteMany({ where: { charterId: 'singleton' } }),
      ...(items.data.length
        ? [
            prisma.serviceCharterItem.createMany({
              data: items.data.map((it, index) => ({
                ...it,
                charterId: 'singleton',
                displayOrder: index,
              })),
            }),
          ]
        : []),
    ]);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }

  revalidatePath('/student-society/service-charter');
  revalidatePath('/admin/service-charter');
  revalidatePath('/', 'layout');
  return { ok: true };
}
