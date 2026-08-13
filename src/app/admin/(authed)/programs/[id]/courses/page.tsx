import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth-server';
import CoursesEditor from './CoursesEditor';

export const metadata = { title: 'Program courses' };

export default async function ProgramCoursesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect('/admin/login');

  const { id } = await params;
  const program = await prisma.program.findUnique({
    where: { id },
    select: {
      id: true,
      programName: true,
      slug: true,
      courses: {
        orderBy: [{ semesterOrder: 'asc' }, { displayOrder: 'asc' }],
        select: {
          id: true,
          semesterLabel: true,
          courseCode: true,
          courseTitle: true,
          credits: true,
          courseType: true,
          prerequisite: true,
        },
      },
    },
  });
  if (!program) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-gray-900">Course structure</h1>
        <p className="mt-1 text-sm text-gray-500">
          {program.programName}
          {program.slug && (
            <>
              {' · '}
              <a href={`/programs/${program.slug}`} target="_blank" rel="noreferrer"
                 className="text-accent hover:underline">
                View public page
              </a>
            </>
          )}
        </p>
      </header>
      <CoursesEditor
        programId={program.id}
        programName={program.programName}
        initial={program.courses}
      />
    </div>
  );
}
