-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "primary_image_url" TEXT,
ADD COLUMN     "thumbnail_url" TEXT;

-- Columna generada de búsqueda full-text (GIN index abajo); la gestiona
-- solo esta migración (Prisma no emite DDL para Unsupported/tsvector).
ALTER TABLE "vehicles" ADD COLUMN "search_vector" tsvector GENERATED ALWAYS AS (
  to_tsvector('spanish', COALESCE(brand, '') || ' ' || COALESCE(model, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(vin, ''))
) STORED;

-- CreateIndex
CREATE INDEX "vehicles_price_id_idx" ON "vehicles"("price", "id");

-- CreateIndex
CREATE INDEX "vehicles_year_id_idx" ON "vehicles"("year", "id");

-- CreateIndex
CREATE INDEX "vehicles_mileage_id_idx" ON "vehicles"("mileage", "id");

-- CreateIndex
CREATE INDEX "vehicles_search_vector_idx" ON "vehicles" USING GIN ("search_vector");

-- Backfill de columnas desnormalizadas desde media primaria
UPDATE "vehicles" v
SET "primary_image_url" = m.url,
    "thumbnail_url" = m.thumbnail_url
FROM (
  SELECT DISTINCT ON (vehicle_id) vehicle_id, url, thumbnail_url
  FROM "media"
  WHERE is_primary = true AND type = 'IMAGE' AND url IS NOT NULL
  ORDER BY vehicle_id, sort_order ASC
) m
WHERE m.vehicle_id = v.id;