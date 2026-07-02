import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, anon);

let ok = true;

// 1) Lectura pública de products debe funcionar.
const read = await supabase.from("products").select("id").limit(1);
if (read.error) {
  console.error("❌ Lectura pública de products FALLÓ:", read.error.message);
  ok = false;
} else {
  console.log("✅ Lectura pública de products OK");
}

// 2) Escritura con anon key debe estar BLOQUEADA.
const write = await supabase
  .from("products")
  .insert([{ title: "__rls_test__", category: "test", description: "x", quantity: 0, units_per_pallet: 0, image_url: "", featured: false, available: false }])
  .select();
if (write.error) {
  console.log("✅ Escritura anónima BLOQUEADA:", write.error.message);
} else {
  console.error("❌ Escritura anónima PERMITIDA (RLS no está protegiendo). Fila creada:", write.data);
  ok = false;
}

process.exit(ok ? 0 : 1);
