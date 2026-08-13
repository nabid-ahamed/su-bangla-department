-- Drop the two lab subsystems (Phase 5).
--
-- The Bangla department has no laboratories, so /about/lab-facility and
-- /about/laboratory-facility, their admin sections and API routes were
-- removed. These four tables backed them and have no foreign-key
-- relationships to anything else.
--
-- Destructive: any seeded lab content is discarded with the tables.
DROP TABLE IF EXISTS "lab";
DROP TABLE IF EXISTS "lab_facility_landing";
DROP TABLE IF EXISTS "laboratory_lab";
DROP TABLE IF EXISTS "laboratory_facility_landing";
