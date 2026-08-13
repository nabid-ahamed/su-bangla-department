-- Faculty: add the two fields the SU-Law fork already carries.
--   fieldOfInterest — research/teaching interests, same Json shape as
--                     the other 8 detail sections.
--   roomNo          — office room number, shown as a contact row.
-- Both nullable; existing rows are unaffected.
ALTER TABLE "faculty" ADD COLUMN IF NOT EXISTS "fieldOfInterest" JSONB;
ALTER TABLE "faculty" ADD COLUMN IF NOT EXISTS "roomNo" TEXT;
