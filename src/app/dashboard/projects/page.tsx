import Link from "next/link";
import { CalendarDays, MapPin, Plus } from "lucide-react";
import { PageTitle } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { AddWeddingModal } from "@/components/forms/add-wedding-modal";

export default async function Projects() {
  const supabase = await createClient();
  const { data: dbProjects } = supabase ? await supabase.from("projects").select("*").order("created_at", { ascending: false }) : { data: [] };
  const { data: dbClients } = supabase ? await supabase.from("clients").select("id, display_name") : { data: [] };

  const projects = (dbProjects || []).map((p) => ({
    name: p.name,
    status: p.status,
    date: p.event_date ? new Date(p.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
    venue: p.venue || "-",
    progress: 0, // Mock for now
  }));

  return (
    <div className="px-5 py-7 lg:px-8">
      <PageTitle eyebrow="Workspace" title="Wedding Projects">
        <AddWeddingModal clients={(dbClients || []).map(c => ({ id: c.id, name: c.display_name }))} />
      </PageTitle>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {projects.map((p, i) => (
          <Link href="/dashboard/timeline" key={p.name} className="group border border-[#e5ebf3] p-5 transition hover:border-[#b8d3f5] hover:shadow-[0_8px_25px_rgba(35,70,110,.06)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[.12em] text-[#98a6b8]">Wedding Project</p>
                <h3 className="mt-2 text-lg font-semibold">{p.name}</h3>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[9px] ${p.status === "preparation" || p.status === "planning" ? "bg-[#edf6ff] text-[#477dbd]" : "bg-[#f1f3f6] text-[#75859b]"}`}>
                {p.status}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-[10px] text-[#7b8da4]">
              <span className="flex items-center gap-1.5"><CalendarDays size={13} />{p.date}</span>
              <span className="flex items-center gap-1.5"><MapPin size={13} />{p.venue}</span>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#edf1f5]">
                <div className="h-full bg-[#2f80ed]" style={{ width: `${p.progress}%` }} />
              </div>
              <span className="text-[10px] font-semibold">{p.progress}%</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
