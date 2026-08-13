-- /about/department-layout — office directory + downloadable plan.
-- Singleton chrome plus one row per office so the table is editable
-- and reorderable from the CMS.

CREATE TABLE "department_layout" (
    "id"                  TEXT NOT NULL DEFAULT 'singleton',
    "universityName"      TEXT NOT NULL DEFAULT 'Sonargaon University',
    "departmentName"      TEXT NOT NULL,
    "addressLine"         TEXT,
    "officeColumnLabel"   TEXT NOT NULL DEFAULT 'Name of the Office',
    "locationColumnLabel" TEXT NOT NULL DEFAULT 'Specific Location of the Office',
    "downloadHeading"     TEXT NOT NULL DEFAULT 'Download the plan',
    "downloadSubtitle"    TEXT,
    "documentTitle"       TEXT NOT NULL DEFAULT 'Departmental Layout Plan',
    "coverUrl"            TEXT,
    "coverPublicId"       TEXT,
    "pdfUrl"              TEXT,
    "pdfPublicId"         TEXT,
    "pdfFileName"         TEXT,
    "updatedAt"           TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_layout_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "department_layout_office" (
    "id"            TEXT NOT NULL,
    "layoutId"      TEXT NOT NULL,
    "officeName"    TEXT NOT NULL,
    "level"         TEXT NOT NULL,
    "building"      TEXT,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder"  INTEGER NOT NULL,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "department_layout_office_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "department_layout_office_layoutId_displayOrder_idx"
    ON "department_layout_office"("layoutId", "displayOrder");

ALTER TABLE "department_layout_office"
    ADD CONSTRAINT "department_layout_office_layoutId_fkey"
    FOREIGN KEY ("layoutId") REFERENCES "department_layout"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
