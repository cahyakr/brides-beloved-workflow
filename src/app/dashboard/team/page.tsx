import { Mail } from "lucide-react";
import { PageTitle } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { TeamInfoModal } from "@/components/forms/team-info-modal";
import { EditTeamModal } from "@/components/forms/edit-team-modal";

export default async function Team() {
  const supabase = await createClient();
  const { data: profiles } = supabase ? await supabase.from("profiles").select("*").order("created_at", { ascending: false }) : { data: [] };

  const team = (profiles || []).map((p) => ({
    id: p.id,
    name: p.full_name,
    email: p.email,
    role: p.role,
    is_active: p.is_active,
    initials: p.full_name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase(),
    title: p.role === "super_admin" ? "Super Admin" : p.role === "team" ? "Wedding Staff" : "User",
  }));

  return (
    <div className="px-5 py-7 lg:px-8">
      <PageTitle eyebrow="Directory" title="Our Team">
        <TeamInfoModal />
      </PageTitle>

      <div className="mt-8 overflow-hidden rounded-xl border border-[#e5ebf3] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e5ebf3] bg-[#f8fafd] text-[#8d9ab0]">
              <tr>
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5ebf3]">
              {team.map((m) => (
                <tr key={m.id} className="transition hover:bg-[#fcfdfd]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#dcecff] text-xs font-bold text-[#276fc9]">
                        {m.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#112b52]">{m.name}</p>
                        <p className="mt-0.5 text-[10px] text-[#8d9ab0] flex items-center gap-1">
                          <Mail size={10} /> {m.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[#536b89]">{m.title}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold ${m.is_active ? 'bg-[#eaf8ef] text-[#5ca36f]' : 'bg-[#fff0f3] text-[#e46a80]'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${m.is_active ? 'bg-[#5ca36f]' : 'bg-[#e46a80]'}`} />
                      {m.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <EditTeamModal profile={{ id: m.id, full_name: m.name, role: m.role, is_active: m.is_active }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
