-- /student-society/service-charter — one card per service, plus the
-- singleton chrome (intro line + downloadable PDF).

CREATE TABLE "service_charter" (
    "id"          TEXT NOT NULL DEFAULT 'singleton',
    "intro"       TEXT,
    "pdfHeading"  TEXT NOT NULL DEFAULT 'Service Charter as a PDF',
    "pdfSubtitle" TEXT,
    "pdfUrl"      TEXT,
    "pdfPublicId" TEXT,
    "pdfFileName" TEXT,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_charter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "service_charter_item" (
    "id"                TEXT NOT NULL,
    "charterId"         TEXT NOT NULL,
    "title"             TEXT NOT NULL,
    "steps"             TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "responsibleName"   TEXT,
    "responsibleRole"   TEXT,
    "responsiblePhone"  TEXT,
    "responsibleEmail"  TEXT,
    "responsibleRoom"   TEXT,
    "responsible2Name"  TEXT,
    "responsible2Role"  TEXT,
    "responsible2Phone" TEXT,
    "responsible2Email" TEXT,
    "responsible2Room"  TEXT,
    "displayOrder"      INTEGER NOT NULL,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_charter_item_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "service_charter_item_charterId_displayOrder_idx"
    ON "service_charter_item"("charterId", "displayOrder");

ALTER TABLE "service_charter_item"
    ADD CONSTRAINT "service_charter_item_charterId_fkey"
    FOREIGN KEY ("charterId") REFERENCES "service_charter"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
