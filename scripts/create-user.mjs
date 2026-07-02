import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv.slice(4).join(" ");

if (!email || !password) {
  console.error(
    'Uso: node --env-file=.env.local scripts/create-user.mjs correo@ejemplo.com "contraseña" "Nombre Apellido"',
  );
  process.exit(1);
}
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true, // marca el correo como confirmado: puede entrar de inmediato, sin email
  user_metadata: name ? { name } : undefined,
});

if (error) {
  console.error("❌ Error al crear usuario:", error.message);
  process.exit(1);
}

console.log("✅ Usuario creado:", email, "· id:", data.user?.id);
