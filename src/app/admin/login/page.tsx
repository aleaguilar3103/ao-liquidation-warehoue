"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setMsg("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function handleForgot() {
    if (!email) {
      setMsg("Escribe tu correo para enviarte el enlace de recuperación.");
      return;
    }
    setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/auth/callback?next=/admin/set-password`,
    });
    setMsg(
      error
        ? "No se pudo enviar el correo. Intenta de nuevo."
        : "Te enviamos un correo para restablecer tu contraseña.",
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F233F] to-[#0A1829] px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-xl font-extrabold text-[#0F233F]">
          Panel de Administración
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Ingresa con tu correo y contraseña.
        </p>

        <label className="mt-6 block text-sm font-semibold text-[#1F2937]">
          Correo
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0F233F]"
        />

        <label className="mt-4 block text-sm font-semibold text-[#1F2937]">
          Contraseña
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0F233F]"
        />

        {msg && <p className="mt-3 text-sm text-[#B91019]">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#E11D27] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#B91019] disabled:opacity-60"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>

        <button
          type="button"
          onClick={handleForgot}
          className="mt-4 w-full text-center text-xs font-medium text-[#6B7280] hover:text-[#0F233F]"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </form>
    </div>
  );
}
