import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  let userProfile = { name: "User", role: "user", initials: "U" };

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
      if (profile) {
        userProfile = {
          name: profile.full_name,
          role: profile.role.replace('_', ' '),
          initials: profile.full_name.split(" ").map((n: string) => n[0]).join("").substring(0,2).toUpperCase()
        };
      }
    }
  }

  return <DashboardShell userProfile={userProfile}>{children}</DashboardShell>;
}
