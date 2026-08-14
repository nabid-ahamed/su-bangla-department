-- Homepage lead-capture popup: singleton settings/copy + the leads it
-- collects. Timing and copy live in the DB so the popup can be tuned
-- or switched off from the dashboard without a deploy.

CREATE TABLE "lead_popup" (
    "id"                 TEXT NOT NULL DEFAULT 'singleton',
    "isEnabled"          BOOLEAN NOT NULL DEFAULT true,
    "delaySeconds"       INTEGER NOT NULL DEFAULT 15,
    "reshowAfterDays"    INTEGER NOT NULL DEFAULT 7,
    "heading"            TEXT NOT NULL DEFAULT 'Start your journey with Sonargaon University',
    "subheading"         TEXT,
    "nameLabel"          TEXT NOT NULL DEFAULT 'Full name',
    "namePlaceholder"    TEXT NOT NULL DEFAULT 'As written on your certificate',
    "phoneLabel"         TEXT NOT NULL DEFAULT 'Mobile number',
    "phonePlaceholder"   TEXT NOT NULL DEFAULT '01XXXXXXXXX',
    "programLabel"       TEXT NOT NULL DEFAULT 'Programme you are interested in',
    "programPlaceholder" TEXT NOT NULL DEFAULT 'Choose a programme',
    "programOptions"     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "submitLabel"        TEXT NOT NULL DEFAULT 'Get admission guidance',
    "footnote"           TEXT,
    "successHeading"     TEXT NOT NULL DEFAULT 'Thank you!',
    "successBody"        TEXT,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_popup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lead" (
    "id"          TEXT NOT NULL,
    "fullName"    TEXT NOT NULL,
    "phone"       TEXT NOT NULL,
    "programme"   TEXT NOT NULL,
    "status"      TEXT NOT NULL DEFAULT 'new',
    "notes"       TEXT,
    "ipAddress"   TEXT,
    "userAgent"   TEXT,
    "sourcePath"  TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "lead_status_submittedAt_idx" ON "lead"("status", "submittedAt");
CREATE INDEX "lead_submittedAt_idx" ON "lead"("submittedAt");

-- Seed the singleton so the popup works immediately after deploy.
INSERT INTO "lead_popup" ("id", "subheading", "footnote", "successBody", "updatedAt")
VALUES (
    'singleton',
    'Get personalized admission guidance from our admission team.',
    'Our admission team will contact you shortly.',
    'Our admission team will contact you shortly.',
    CURRENT_TIMESTAMP
);
