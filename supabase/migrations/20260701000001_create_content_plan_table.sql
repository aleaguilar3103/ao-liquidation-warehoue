-- Calendario de Contenido: tabla content_plan
-- RLS se activa en la migración 20260702000001_admin_auth_rls.sql (lectura/escritura solo para usuarios autenticados).

CREATE TABLE IF NOT EXISTS content_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_date DATE NOT NULL,
  channel TEXT NOT NULL DEFAULT 'instagram',      -- 'instagram' | 'facebook' | 'ambos'
  format TEXT NOT NULL DEFAULT 'reel',            -- 'reel' | 'carrusel' | 'estatico' | 'historia'
  title TEXT NOT NULL,
  copy TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'nuevo',           -- 'nuevo' | 'produccion' | 'publicado' | 'pautado'
  notes TEXT DEFAULT '',
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_plan_scheduled_date ON content_plan(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_plan_status ON content_plan(status);
CREATE INDEX IF NOT EXISTS idx_content_plan_channel ON content_plan(channel);

alter publication supabase_realtime add table content_plan;
