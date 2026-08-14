'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import { leadPopupUpdateSchema, leadStatusEnum } from '@/lib/validation';

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

async function requireAuth(): Promise<ActionResult | null> {
  const session = await getSession();
  if (!session?.user) return { ok: false, error: 'Not authenticated' };
  return null;
}

export async function updateLeadPopupAction(
  _prev: ActionResult | { ok: null },
  formData: FormData,
): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;

  const parsed = leadPopupUpdateSchema.safeParse({
    // An unchecked checkbox is absent from the payload entirely.
    isEnabled:       formData.get('isEnabled') === 'on',
    delaySeconds:    getStr(formData, 'delaySeconds'),
    reshowAfterDays: getStr(formData, 'reshowAfterDays'),
    heading:         getStr(formData, 'heading'),
    subheading:      emptyToNull(formData.get('subheading')),
    nameLabel:       getStr(formData, 'nameLabel'),
    namePlaceholder: getStr(formData, 'namePlaceholder'),
    phoneLabel:      getStr(formData, 'phoneLabel'),
    phonePlaceholder: getStr(formData, 'phonePlaceholder'),
    programLabel:    getStr(formData, 'programLabel'),
    programPlaceholder: getStr(formData, 'programPlaceholder'),
    // One programme per line; empty falls back to the live Program list.
    programOptions:  getStr(formData, 'programOptions')
      .split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
    submitLabel:     getStr(formData, 'submitLabel'),
    footnote:        emptyToNull(formData.get('footnote')),
    successHeading:  getStr(formData, 'successHeading'),
    successBody:     emptyToNull(formData.get('successBody')),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; '),
    };
  }

  try {
    await prisma.leadPopup.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...parsed.data },
      update: parsed.data,
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }

  revalidatePath('/admin/lead-popup');
  revalidatePath('/');
  return { ok: true };
}

export async function updateLeadStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;

  const parsed = leadStatusEnum.safeParse(status);
  if (!parsed.success) return { ok: false, error: 'Invalid status' };

  try {
    await prisma.lead.update({ where: { id }, data: { status: parsed.data } });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2025') return { ok: false, error: 'Lead not found' };
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }
  revalidatePath('/admin/leads');
  revalidatePath('/admin');
  return { ok: true };
}

export async function deleteLeadAction(id: string): Promise<ActionResult> {
  const denied = await requireAuth();
  if (denied) return denied;
  try {
    await prisma.lead.delete({ where: { id } });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2025') return { ok: false, error: 'Lead not found' };
    return { ok: false, error: e instanceof Error ? e.message : 'Database error' };
  }
  revalidatePath('/admin/leads');
  revalidatePath('/admin');
  return { ok: true };
}
