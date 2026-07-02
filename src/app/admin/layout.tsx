import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {user && (
        <header className="flex items-center justify-between gap-4 border-b border-[#E5E7EB] bg-white px-6 py-3">
          <span className="text-sm font-semibold text-[#0F233F]">
            AO Liquidation Warehouse · Admin
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#6B7280]">{user.email}</span>
            <form action="/admin/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg bg-[#0F233F] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A1829]"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>
      )}
      {children}
    </div>
  );
}
