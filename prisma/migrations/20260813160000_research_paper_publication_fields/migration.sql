-- ResearchPaper: add the publication-metadata columns the SU-Law fork
-- already carries, so the department's spreadsheet data (DOI/URL,
-- publisher, ISSN/indexing, co-authors, author designation) can be
-- stored and rendered instead of being flattened into the title.
--
-- All nullable; existing rows are unaffected.
ALTER TABLE "research_paper" ADD COLUMN IF NOT EXISTS "authorRole"     TEXT;
ALTER TABLE "research_paper" ADD COLUMN IF NOT EXISTS "facultySlug"    TEXT;
ALTER TABLE "research_paper" ADD COLUMN IF NOT EXISTS "coAuthors"      JSONB;
ALTER TABLE "research_paper" ADD COLUMN IF NOT EXISTS "link"           TEXT;
ALTER TABLE "research_paper" ADD COLUMN IF NOT EXISTS "linkLabel"      TEXT;
ALTER TABLE "research_paper" ADD COLUMN IF NOT EXISTS "publisher"      TEXT;
ALTER TABLE "research_paper" ADD COLUMN IF NOT EXISTS "indexing"       TEXT;
ALTER TABLE "research_paper" ADD COLUMN IF NOT EXISTS "quartile"       TEXT;
ALTER TABLE "research_paper" ADD COLUMN IF NOT EXISTS "metrics"        TEXT;
ALTER TABLE "research_paper" ADD COLUMN IF NOT EXISTS "authorPosition" TEXT;
-- publicationType — "Journal" | "Book" | "Conference", shown as a pill.
ALTER TABLE "research_paper" ADD COLUMN IF NOT EXISTS "publicationType" TEXT;
