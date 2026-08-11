import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  if (!supabase) return <PortalShell clientName="Sarah & Daniel">{children}</PortalShell>;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clientData } = await supabase.from("clients").select("display_name").eq("profile_id", user.id).single();
  const clientName = clientData?.display_name || "Dzakwan & Mella";

  return (
    <PortalShell clientName={clientName}>
      {children}
    </PortalShell>
  );
}
