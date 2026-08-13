-- CreateTable
CREATE TABLE "home_overview" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "heading" TEXT,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT,
    "imageAlt" TEXT,
    "primaryCtaLabel" TEXT NOT NULL,
    "primaryCtaHref" TEXT NOT NULL,
    "primaryCtaExternal" BOOLEAN NOT NULL DEFAULT false,
    "secondaryCtaLabel" TEXT NOT NULL,
    "secondaryCtaHref" TEXT NOT NULL,
    "secondaryCtaExternal" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_overview_pkey" PRIMARY KEY ("id")
);

-- Seed the singleton with the copy that was previously hardcoded in
-- OverviewSection.tsx, so the public page renders identically after
-- this migration. heading is left NULL => falls back to
-- DepartmentIdentity.name at render time.
INSERT INTO "home_overview" (
    "id", "heading", "body", "imageUrl", "imagePublicId", "imageAlt",
    "primaryCtaLabel", "primaryCtaHref", "primaryCtaExternal",
    "secondaryCtaLabel", "secondaryCtaHref", "secondaryCtaExternal",
    "updatedAt"
) VALUES (
    'singleton',
    NULL,
    'At the heart of scholarship and cultural stewardship, the Department of Bangla is committed to shaping thoughtful readers, writers, and researchers. Explore the rich world of Bangla language and literature, where a thousand-year tradition meets contemporary criticism, and where careful study deepens our understanding of identity and society. With a focus on literary history, linguistics, folklore, and translation, our department prepares students for teaching, research, media, publishing, and public service.',
    '/assets/homeimg.webp',
    NULL,
    NULL,
    'Explore More',
    '/about/overview',
    false,
    'Dean''s Message',
    '/about/deans-message',
    false,
    CURRENT_TIMESTAMP
) ON CONFLICT ("id") DO NOTHING;
