import { Prisma } from '@prisma/client';

/**
 * Shape a validated ResearchPaper row into Prisma-safe write data.
 *
 * Only `coAuthors` needs coercion: it is a Json column, and Prisma
 * rejects a bare `null` there — SQL NULL must be expressed as
 * `Prisma.JsonNull`.
 *
 * Lives outside the 'use server' action module because that file may
 * only export async functions, and the REST routes need this too.
 */
export function buildResearchPaperData<T extends { coAuthors?: unknown }>(parsed: T) {
  return {
    ...parsed,
    coAuthors:
      parsed.coAuthors == null
        ? Prisma.JsonNull
        : (parsed.coAuthors as Prisma.InputJsonValue),
  };
}
