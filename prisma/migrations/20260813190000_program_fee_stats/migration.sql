-- Admission / semester fee shown in the program detail "At a Glance"
-- strip. Free-form text so the figure renders exactly as entered
-- (currency prefix, thousands separators); never used for arithmetic.

ALTER TABLE "program" ADD COLUMN "admissionFee" TEXT;
ALTER TABLE "program" ADD COLUMN "semesterFee"  TEXT;
