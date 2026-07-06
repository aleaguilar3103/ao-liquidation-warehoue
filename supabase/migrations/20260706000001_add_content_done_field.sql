-- Calendario de Contenido: marca "hecho / ya se hizo".
-- Campo independiente del status (flujo de trabajo): permite palomear una pieza
-- como completada sin importar en qué estado esté.
-- RLS ya cubre content_plan (migración 20260702000001), no cambia con la columna.

ALTER TABLE content_plan
  ADD COLUMN IF NOT EXISTS done BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_content_plan_done ON content_plan(done);
