-- Add a stable, human-readable slug for public QR links while keeping the
-- original shortcode column for existing printed codes and fallback lookups.
ALTER TABLE "QrCode" ADD COLUMN "slug" TEXT;

WITH normalized AS (
  SELECT
    "id",
    lower(trim(both '-' from regexp_replace("label", '[^a-zA-Z0-9]+', '-', 'g'))) AS base_slug
  FROM "QrCode"
)
UPDATE "QrCode" AS q
SET "slug" = concat(
  CASE WHEN normalized.base_slug = '' THEN 'qr-code' ELSE normalized.base_slug END,
  '-',
  lower(left(regexp_replace(q."id", '[^a-zA-Z0-9]+', '', 'g'), 6))
)
FROM normalized
WHERE q."id" = normalized."id";

ALTER TABLE "QrCode" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "QrCode_slug_key" ON "QrCode"("slug");
CREATE INDEX "QrCode_type_status_createdAt_idx" ON "QrCode"("type", "status", "createdAt");
CREATE INDEX "QrCode_createdAt_idx" ON "QrCode"("createdAt");
CREATE INDEX "Scan_scannedAt_idx" ON "Scan"("scannedAt");
