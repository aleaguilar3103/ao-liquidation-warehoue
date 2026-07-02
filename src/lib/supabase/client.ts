import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

/** Cliente de Supabase para el navegador. Lleva la sesión del usuario (cookies). */
export function createClient() {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return browserClient;
}
