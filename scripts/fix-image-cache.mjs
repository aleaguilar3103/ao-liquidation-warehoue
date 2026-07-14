// Re-sube cada imagen de `product-images` a la MISMA ruta con los MISMOS bytes,
// cambiando únicamente el header Cache-Control (no-cache -> 1 año).
//
// Seguridad:
//   - Nunca borra nada (solo upload con upsert).
//   - Re-sube bytes idénticos a los descargados (no recomprime): valida que el
//     tamaño descargado coincida EXACTO con el de la metadata antes de subir.
//   - Idempotente: correrlo de nuevo no hace daño.
//   - DRY_RUN=1 -> solo descarga y valida, no escribe nada.
//
// Uso:  set -a; source .env.local; set +a; DRY_RUN=1 node fix-image-cache.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'product-images';
const NEW_CACHE = '31536000'; // 1 año, en segundos
const DRY_RUN = process.env.DRY_RUN === '1';
const CONCURRENCY = 5;

if (!url || !serviceKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function listAll() {
  const all = [];
  let offset = 0;
  const limit = 1000;
  for (;;) {
    const { data, error } = await supabase.storage.from(BUCKET).list('', {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }
  return all;
}

async function processOne(obj) {
  const name = obj.name;
  const expectedSize = obj.metadata?.size;
  const mimetype = obj.metadata?.mimetype || 'image/jpeg';

  // Placeholders / carpetas: sin metadata de tamaño -> no tocar.
  if (expectedSize == null) return { name, status: 'skip-nometa' };

  const { data: blob, error: dlErr } = await supabase.storage.from(BUCKET).download(name);
  if (dlErr || !blob) return { name, status: 'error-download', err: dlErr?.message };

  const buf = Buffer.from(await blob.arrayBuffer());

  // Red de seguridad: solo re-subimos si los bytes están completos e idénticos.
  if (buf.length === 0) return { name, status: 'skip-empty' };
  if (buf.length !== expectedSize) {
    return { name, status: 'skip-sizemismatch', got: buf.length, expected: expectedSize };
  }

  if (DRY_RUN) return { name, status: 'dry-ok', size: buf.length };

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(name, buf, {
    upsert: true,
    cacheControl: NEW_CACHE,
    contentType: mimetype,
  });
  if (upErr) return { name, status: 'error-upload', err: upErr.message };
  return { name, status: 'ok', size: buf.length };
}

async function run() {
  const objs = await listAll();
  console.log(`Objetos listados: ${objs.length}  | DRY_RUN=${DRY_RUN}  | concurrency=${CONCURRENCY}`);

  const results = [];
  let i = 0;
  async function worker() {
    while (i < objs.length) {
      const idx = i++;
      const r = await processOne(objs[idx]);
      results.push(r);
      const problem = r.status.startsWith('error') || r.status.startsWith('skip-sizemismatch') || r.status === 'skip-empty';
      if (problem) {
        console.log(`  [${idx + 1}/${objs.length}] ${r.status.toUpperCase()} ${r.name} ${r.err || ''} ${r.expected != null ? `exp=${r.expected} got=${r.got}` : ''}`);
      } else if ((idx + 1) % 50 === 0) {
        console.log(`  ...${idx + 1}/${objs.length}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const by = results.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});
  const errors = results.filter((r) => r.status.startsWith('error') || r.status === 'skip-sizemismatch' || r.status === 'skip-empty');
  console.log('\n=== Resumen ===');
  console.log(by);
  console.log(`Procesadas OK: ${(by.ok || 0) + (by['dry-ok'] || 0)}  |  Problemas: ${errors.length}`);
  if (errors.length) {
    console.log('Archivos con problema (NO modificados):');
    for (const e of errors) console.log('  -', e.name, e.status, e.err || '');
    process.exit(2);
  }
}

run().catch((e) => { console.error('FATAL', e); process.exit(1); });
