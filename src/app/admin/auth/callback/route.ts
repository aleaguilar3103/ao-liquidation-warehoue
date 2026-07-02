import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next") ?? "/admin";
  // Evita open-redirect: resolvemos con el mismo parser que hará la redirección
  // y solo aceptamos el destino si se queda en nuestro propio origin.
  let next = "/admin";
  try {
    const candidate = new URL(rawNext, origin);
    if (candidate.origin === origin) {
      next = candidate.pathname + candidate.search + candidate.hash;
    }
  } catch {
    // rawNext inválido → se queda el default "/admin"
  }

  const supabase = createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  return NextResponse.redirect(new URL("/admin/login?error=enlace", origin));
}
