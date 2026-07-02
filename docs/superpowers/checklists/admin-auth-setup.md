# Checklist de configuración — Auth del Admin

## Supabase Dashboard → Authentication
- [ ] Providers → Email: habilitado.
- [ ] Providers → Email: **desactivar** "Allow new users to sign up" (invitación-solo).
- [ ] URL Configuration → Site URL: `https://aoliquidationwarehouse.com`.
- [ ] URL Configuration → Redirect URLs (agregar ambas):
  - `https://aoliquidationwarehouse.com/admin/auth/callback`
  - `http://localhost:3000/admin/auth/callback`
- [ ] SMTP Settings (Custom SMTP):
  - Host: `smtp.resend.com`
  - Port: `465` (o `587`)
  - Username: `resend`
  - Password: el valor de `RESEND_API_KEY`
  - Sender email: `noreply@send.bralto.io`
  - Sender name: `AO Liquidation Warehouse`
- [ ] Email Templates → "Invite user" y "Reset password": redactar en español con la marca.

## Env / Vercel
- [ ] `NEXT_PUBLIC_SITE_URL=https://aoliquidationwarehouse.com` en `.env.local` y en Vercel.
- [ ] Confirmar en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`.

## Base de datos
- [ ] `npx supabase db push` aplicó `20260702000001_admin_auth_rls.sql`.
- [ ] `node --env-file=.env.local scripts/verify-rls.mjs` sale con código 0.
