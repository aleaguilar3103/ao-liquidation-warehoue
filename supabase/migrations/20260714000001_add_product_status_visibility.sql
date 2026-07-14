-- Estados de producto + visibilidad interna.
-- Aditivo: agrega columnas y las puebla desde el booleano `available` existente.
-- La eliminación de `available`/`condition` va en una migración posterior, una vez
-- que el código nuevo ya no las use.

ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'disponible';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT true;

-- Mapear el estado anterior (booleano) al nuevo enum de texto.
UPDATE products SET status = 'no_disponible' WHERE available = false;
UPDATE products SET status = 'disponible'   WHERE available = true OR available IS NULL;
