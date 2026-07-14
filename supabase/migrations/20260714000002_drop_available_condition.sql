-- Limpieza destructiva: elimina las columnas ya migradas/no usadas.
-- `available` fue migrada a `status` en 20260714000001; `condition` nunca se usó.
-- Se aplica DESPUÉS de desplegar el código que ya no las referencia.

ALTER TABLE products DROP COLUMN IF EXISTS available;
ALTER TABLE products DROP COLUMN IF EXISTS condition;
