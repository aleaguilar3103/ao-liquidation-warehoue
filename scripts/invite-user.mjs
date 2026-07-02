import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aoliquidationwarehouse.com";

const email = process.argv[2];
if (!email) {
  console.error(
    "Uso: node --env-file=.env.local scripts/invite-user.mjs correo@ejemplo.com",
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

const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
  redirectTo: `${siteUrl}/admin/auth/callback?next=/admin/set-password`,
});

if (error) {
  console.error("❌ Error al invitar:", error.message);
  process.exit(1);
}

console.log("✅ Invitación enviada a", email, "· user id:", data.user?.id);
