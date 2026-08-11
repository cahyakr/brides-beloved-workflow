import { Search, SlidersHorizontal, UserPlus } from "lucide-react";
import { PageTitle } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { AddClientModal } from "@/components/forms/add-client-modal";

export default async function Clients() {
  const supabase = await createClient();
  const { data: dbClients } = supabase ? await supabase.from("clients").select(`
    id, display_name, wedding_date, venue, package_name, status,
    projects (
      id, project_members (
        project_role, profiles (full_name)
      )
    )
  `) : { data: [] };

  const clients = (dbClients || []).map((c) => {
    // Find project manager from the first project
    const project = c.projects?.[0];
    const pmMember = project?.project_members?.find((pm: any) => pm.project_role === "Project Manager");
    const pm = (pmMember?.profiles as any)?.full_name || "Unassigned";

    return {
      name: c.display_name,
      initials: c.display_name.split(" & ").map((n: string) => n[0]).join(""),
      date: c.wedding_date ? new Date(c.wedding_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
      venue: c.venue || "-",
      package: c.package_name || "-",
      progress: 0, // Mock for now, would require calculating completed tasks
      status: c.status === "active" ? "Active" : c.status,
      pm
    };
  });

  return (
    <div className="px-5 py-7 lg:px-8">
      <PageTitle eyebrow="Directory" title="Clients">
        <AddClientModal />
      </PageTitle>
      <div className="mt-7 border border-[#e5ebf3]">
        <div className="flex flex-col gap-3 border-b border-[#e8edf3] p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex h-9 w-full max-w-xs items-center gap-2 rounded-md border border-[#e1e8f0] px-3 text-[#8797ad]">
            <Search size={14} />
            <input placeholder="Cari client..." className="w-full text-xs outline-none" />
          </label>
          <button className="flex h-9 items-center gap-2 text-xs text-[#71839c]">
            <SlidersHorizontal size={14} /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#fafbfd] text-[9px] uppercase tracking-[.08em] text-[#93a0b3]">
              <tr>
                {["Client", "Wedding Date", "Venue", "Package", "Progress", "Status", "Project Manager"].map((x) => (
                  <th key={x} className="px-5 py-3 font-semibold">{x}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={c.name} className="border-t border-[#edf1f5] text-[11px]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-9 w-9 place-items-center rounded-full ${i === 0 ? "bg-[#e8f2ff] text-[#3375c7]" : "bg-[#f0f2f5] text-[#75859a]"}`}>{c.initials}</span>
                      <span className="font-semibold">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#71839b]">{c.date}</td>
                  <td className="px-5 py-4 text-[#71839b]">{c.venue}</td>
                  <td className="px-5 py-4">{c.package}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#edf1f5]">
                        <div className="h-full bg-[#2f80ed]" style={{ width: `${c.progress}%` }} />
                      </div>
                      <span className="text-[9px] text-[#8493a8]">{c.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[#edf6ff] px-2 py-1 text-[9px] text-[#477dbd]">{c.status}</span>
                  </td>
                  <td className="px-5 py-4 text-[#657994]">{c.pm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
