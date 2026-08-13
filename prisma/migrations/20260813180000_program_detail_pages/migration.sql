-- Program detail pages (/programs/[slug])
--
-- Adds the long-form fields the detail page renders, plus a course
-- table for the curriculum. `slug` is nullable + unique: existing rows
-- keep working (no detail page) until one is assigned.

ALTER TABLE "program" ADD COLUMN "slug"           TEXT;
ALTER TABLE "program" ADD COLUMN "overview"       TEXT;
ALTER TABLE "program" ADD COLUMN "totalCredits"   TEXT;
ALTER TABLE "program" ADD COLUMN "semesterFormat" TEXT;
ALTER TABLE "program" ADD COLUMN "degreeAwarded"  TEXT;
ALTER TABLE "program" ADD COLUMN "careerIntro"    TEXT;
ALTER TABLE "program" ADD COLUMN "careerItems"    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "program" ADD COLUMN "careerClosing"  TEXT;

CREATE UNIQUE INDEX "program_slug_key" ON "program"("slug");

CREATE TABLE "program_course" (
    "id"            TEXT NOT NULL,
    "programId"     TEXT NOT NULL,
    "semesterLabel" TEXT NOT NULL,
    "semesterOrder" INTEGER NOT NULL,
    "courseCode"    TEXT NOT NULL,
    "courseTitle"   TEXT NOT NULL,
    "credits"       DOUBLE PRECISION NOT NULL,
    "courseType"    TEXT NOT NULL DEFAULT 'Core',
    "prerequisite"  TEXT,
    "displayOrder"  INTEGER NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_course_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "program_course_programId_semesterOrder_displayOrder_idx"
    ON "program_course"("programId", "semesterOrder", "displayOrder");

ALTER TABLE "program_course"
    ADD CONSTRAINT "program_course_programId_fkey"
    FOREIGN KEY ("programId") REFERENCES "program"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
