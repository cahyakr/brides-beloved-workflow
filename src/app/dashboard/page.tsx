import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Plus, Sparkles, Users } from "lucide-react";
import { PageTitle } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddWeddingModal } from "@/components/forms/add-wedding-modal";

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) return <div>Database not connected</div>;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const firstName = profile?.full_name?.split(" ")[0] || "User";

  // Date formatting
  const today = new Date();
  const dateString = today.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const shortDateString = today.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long" });

  // Counts
  const { count: activeWeddings } = await supabase.from("projects").select("*", { count: "exact", head: true }).neq("status", "completed");
  const { count: newLeads } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new");
  
  // Clients for Modal
  const { data: dbClients } = await supabase.from("clients").select("id, display_name");
  
  // Tasks due
  const { data: myTasks } = await supabase.from("task_assignees").select("task_id").eq("user_id", user.id);
  const myTaskIds = (myTasks || []).map(t => t.task_id);
  
  const { data: allTasks } = await supabase.from("tasks").select("id, title, due_date, status, projects(name)").in("id", myTaskIds.length ? myTaskIds : ['00000000-0000-0000-0000-000000000000']).neq("status", "completed").order("due_date", { ascending: true });
  
  const tasksDue = allTasks?.length || 0;

  // Upcoming weddings (projects)
  const { data: upcomingProjects } = await supabase.from("projects")
    .select("id, name, venue, event_date, status, tasks(id, status)")
    .neq("status", "completed")
    .order("event_date", { ascending: true })
    .limit(3);

  const formattedProjects = (upcomingProjects || []).map(p => {
    const total = p.tasks?.length || 0;
    const completed = p.tasks?.filter((t: any) => t.status === "completed").length || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      name: p.name,
      venue: p.venue || "-",
      date: p.event_date ? new Date(p.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-",
      progress,
      status: p.status
    };
  });

  const todaysFocus = (allTasks || []).slice(0, 4).map(t => ({
    title: t.title,
    project: (t.projects as any)?.name || "Internal",
    due: t.due_date ? new Date(t.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "-"
  }));

  return (
    <div className="px-5 py-7 lg:px-8 lg:py-8">
      <PageTitle eyebrow={dateString} title={`Selamat datang, ${firstName} 👋`}>
        <AddWeddingModal clients={(dbClients || []).map(c => ({ id: c.id, name: c.display_name }))} />
      </PageTitle>
      
      <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active Weddings", activeWeddings || 0, "Sedang berjalan", Sparkles, "#eaf3ff", "#2f80ed", "/dashboard/projects"],
          ["Upcoming Events", formattedProjects.length, "Terjadwal", CalendarDays, "#f1ecff", "#7458c8", "/dashboard/projects"],
          ["New Leads", newLeads || 0, "Prospek baru", Users, "#ecf8f3", "#3c9a75", "/dashboard/leads"],
          ["Tasks Due", tasksDue, "Tugas aktifmu", Clock3, "#fff5e7", "#cf8a2a", "/dashboard/timeline"],
        ].map(([label, num, note, Icon, bg, color, href]) => (
          <Link href={String(href)} key={String(label)} className="border border-[#e7edf5] bg-white p-5 hover:border-[#cfd8e3] transition-colors block">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-medium text-[#8291a8]">{String(label)}</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-.04em]">{String(num)}</p>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-lg" style={{background:String(bg),color:String(color)}}>
                {/* @ts-ignore */}
                <Icon size={17}/>
              </span>
            </div>
            <p className="mt-4 text-[10px] text-[#98a5b8]">{String(note)}</p>
          </Link>
        ))}
      </div>
      
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section className="border border-[#e7edf5]">
          <div className="flex items-center justify-between border-b border-[#edf1f5] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Upcoming Weddings</h2>
              <p className="mt-1 text-[10px] text-[#91a0b5]">Wedding terdekat dan progress persiapannya</p>
            </div>
            <Link href="/dashboard/projects" className="text-[11px] font-semibold text-[#2f80ed]">View all</Link>
          </div>
          <div>
            {formattedProjects.length === 0 && (
               <div className="px-5 py-8 text-center text-xs text-[#8291a8]">Belum ada project aktif.</div>
            )}
            {formattedProjects.map((p, i) => (
              <div key={p.name} className="grid items-center gap-4 border-b border-[#eff2f6] px-5 py-4 last:border-0 sm:grid-cols-[1fr_135px_100px]">
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[11px] font-bold ${i===0?"bg-[#eaf3ff] text-[#2f75d0]":"bg-[#f4f5f7] text-[#6e7e93]"}`}>
                    {p.name.split(" ").slice(0,2).map((n: string) => n[0]).join("").toUpperCase()}
                  </span>
                  <div>
                    <p className="text-xs font-semibold">{p.name}</p>
                    <p className="mt-1 text-[10px] text-[#8b9ab0]">{p.venue} · {p.date}</p>
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-[9px] text-[#91a0b3]">
                    <span>Progress</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#edf1f5]">
                    <div className="h-full rounded-full bg-[#2f80ed]" style={{width:`${p.progress}%`}}/>
                  </div>
                </div>
                <span className="w-fit rounded-full bg-[#eff5ff] px-2.5 py-1 text-[9px] font-semibold text-[#3f76ba] capitalize">{p.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </section>
        
        <section className="border border-[#e7edf5]">
          <div className="border-b border-[#edf1f5] px-5 py-4">
            <h2 className="text-sm font-semibold">Today&apos;s Focus</h2>
            <p className="mt-1 text-[10px] text-[#91a0b5]">{shortDateString}</p>
          </div>
          <div className="p-5">
            {todaysFocus.length === 0 && (
               <div className="py-4 text-center text-xs text-[#8291a8]">Tidak ada task yang urgent hari ini.</div>
            )}
            {todaysFocus.map((t, i) => (
              <div key={i} className="flex gap-3 pb-5 last:pb-0">
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${i===0?"border-[#8bb9f3] bg-[#edf5ff] text-[#2f80ed]":"border-[#d7dee8] text-transparent"}`}>
                  <CheckCircle2 size={12}/>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{t.title}</p>
                  <p className="mt-1 text-[10px] text-[#8f9db2] truncate">{t.project} · {t.due}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/timeline" className="flex items-center justify-between border-t border-[#edf1f5] px-5 py-3 text-[10px] font-semibold text-[#2f80ed]">
            Open timeline <ArrowRight size={13}/>
          </Link>
        </section>
      </div>
    </div>
  );
}
