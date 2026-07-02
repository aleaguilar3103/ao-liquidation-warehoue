"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (password.length < 8) {
      setMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMsg(
        "No se pudo guardar. Es posible que el enlace haya expirado; pide una nueva invitación.",
      );
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0F233F] to-[#0A1829] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-xl font-extrabold text-[#0F233F]">
          Crea tu contraseña
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Define la contraseña con la que entrarás al panel.
        </p>

        <label className="mt-6 block text-sm font-semibold text-[#1F2937]">
          Contraseña
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0F233F]"
        />

        <label className="mt-4 block text-sm font-semibold text-[#1F2937]">
          Confirmar contraseña
        </label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#0F233F]"
        />

        {msg && <p className="mt-3 text-sm text-[#B91019]">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-[#E11D27] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#B91019] disabled:opacity-60"
        >
          {loading ? "Guardando…" : "Guardar y entrar"}
        </button>
      </form>
    </div>
  );
}
