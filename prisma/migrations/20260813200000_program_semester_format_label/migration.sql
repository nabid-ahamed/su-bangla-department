-- Caption for the semester-format stat card. The university uses
-- "Bi-Semester" for six-month terms and "Tri-Semester" elsewhere, so
-- the label is stored per program rather than hardcoded in the page.

ALTER TABLE "program" ADD COLUMN "semesterFormatLabel" TEXT;

-- Backfill the departments already on six-month terms.
UPDATE "program"
   SET "semesterFormatLabel" = 'Bi-Semester'
 WHERE "semesterFormat" IS NOT NULL;
