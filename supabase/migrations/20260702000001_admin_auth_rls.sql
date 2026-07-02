-- products: catálogo público (lectura) + escritura solo autenticados
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_public_read" ON products
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "products_auth_insert" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "products_auth_update" ON products
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "products_auth_delete" ON products
  FOR DELETE TO authenticated USING (true);

-- content_plan: solo autenticados (no es público)
ALTER TABLE content_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_auth_all" ON content_plan
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
