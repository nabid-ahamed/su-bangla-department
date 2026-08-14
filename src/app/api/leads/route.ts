import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { leadCreateSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';

// Honeypot field name — must match the hidden input in LeadPopup.
// Real users never fill it; bots fill every input they find.
const HONEYPOT_FIELD = 'website';

function getClientIp(request: NextRequest): string | null {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0];
    if (first) return first.trim();
  }
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return null;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Silently accept honeypot hits so bots don't learn they were caught.
  const honeypot = (body as Record<string, unknown>)[HONEYPOT_FIELD];
  if (typeof honeypot === 'string' && honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent');

  // Dedicated namespace so this bucket isn't shared with the contact
  // form, newsletter signup or club application.
  const limit = checkRateLimit(`lead:${ip ?? 'no-ip'}`);
  if (!limit.allowed) {
    const retryAfter = Math.max(1, Math.ceil((limit.resetMs - Date.now()) / 1000));
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  const parsed = leadCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Validation failed' },
      { status: 400 },
    );
  }

  try {
    await prisma.lead.create({
      data: {
        fullName:   parsed.data.fullName,
        phone:      parsed.data.phone,
        programme:  parsed.data.programme,
        sourcePath: parsed.data.sourcePath ?? null,
        ipAddress:  ip,
        userAgent,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Could not save your details' }, { status: 500 });
  }

  // Refresh the admin list + dashboard badge.
  revalidatePath('/admin/leads');
  revalidatePath('/admin');
  return NextResponse.json({ ok: true });
}
