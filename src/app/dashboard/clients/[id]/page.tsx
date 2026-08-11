import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, Circle, Clock3, MapPin, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageTitle } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

type ClientTask = { id: string; title: string; description: string | null; category: string | null; status: string; priority: string; due_date: string | null; visible_to_client: boolean };
type ClientDetail = {
  id: string; display_name: string; email: string; phone: string | null; wedding_date: string | null; venue: string | null; package_name: string | null; status: string;
  projects: Array<{ id: string; name: string; event_date: string | null; venue: string | null; status: string; tasks: ClientTask[]; project_members: Array<{ project_role: string; profiles: { full_name: string } | null }> }>;
};

export default async function ClientProgressPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) notFound();

  const { data: client } = await supabase.from("clients").select(`
    id, display_name, email, phone, wedding_date, venue, package_name, status,
    projects (
      id, name, event_date, venue, status,
      tasks (id, title, description, category, status, priority, due_date, visible_to_client),
      project_members (project_role, profiles(full_name))
    )
  `).eq("id", id).single();

  if (!client) notFound();
  const typedClient = client as unknown as ClientDetail;
  const projects = typedClient.projects || [];
  const project = projects[0];
  const tasks = project?.tasks || [];
  const completed = tasks.filter((task) => task.status === "completed").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const blocked = tasks.filter((task) => task.status === "blocked").length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const phases = Array.from(new Set(tasks.map((task) => task.category || "Persiapan Umum")));
  const managers = (project?.project_members || []).map((member) => member.profiles?.full_name).filter((name): name is string => Boolean(name));
  const eventDate = project?.event_date || typedClient.wedding_date;
  const dateLabel = eventDate ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${eventDate}T00:00:00`)) : "Belum ditentukan";

  return (
    <div className="px-5 py-7 lg:px-8 lg:py-8">
      <Link href="/dashboard/clients" className="mb-5 inline-flex items-center gap-2 text-[10px] font-semibold text-[#71839b] hover:text-[#2f80ed]"><ArrowLeft size={13} />Kembali ke clients</Link>
      <PageTitle eyebrow="Client progress" title={typedClient.display_name}>
        <Link href="/dashboard/timeline" className="flex h-9 items-center gap-2 rounded-md bg-[#2f80ed] px-4 text-[10px] font-semibold text-white">Buka timeline</Link>
      </PageTitle>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {([
          ["Overall Progress", `${progress}%`, `${completed}/${tasks.length} task selesai`, CheckCircle2, "#eaf3ff", "#2f80ed"],
          ["In Progress", inProgress, "Sedang dikerjakan", Clock3, "#fff5e7", "#cf8a2a"],
          ["Blocked", blocked, "Perlu perhatian", Circle, "#fff0f1", "#d96470"],
          ["Team", managers.length, managers.join(", ") || "Belum ditugaskan", Users, "#ecf8f3", "#3c9a75"],
        ] as Array<[string, string | number, string, LucideIcon, string, string]>).map(([label, value, note, Icon, background, color]) => (
          <section key={String(label)} className="border border-[#e5ebf3] bg-white p-5">
            <div className="flex items-start justify-between"><div><p className="text-[10px] text-[#8493a8]">{String(label)}</p><p className="mt-3 text-2xl font-semibold tracking-[-.03em]">{String(value)}</p></div><span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: String(background), color: String(color) }}><Icon size={16} /></span></div>
            <p className="mt-3 truncate text-[9px] text-[#98a5b7]">{String(note)}</p>
          </section>
        ))}
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_290px]">
        <section className="border border-[#e5ebf3] bg-white">
          <div className="flex items-center justify-between border-b border-[#e9eef4] px-5 py-4"><div><h2 className="text-sm font-semibold">Progress per fase</h2><p className="mt-1 text-[9px] text-[#92a0b4]">Status pekerjaan yang juga tampil di portal klien</p></div><span className="text-[10px] font-semibold text-[#2f80ed]">{phases.length} fase</span></div>
          <div className="divide-y divide-[#edf1f5]">
            {phases.map((phase, index) => {
              const phaseTasks = tasks.filter((task) => (task.category || "Persiapan Umum") === phase);
              const phaseDone = phaseTasks.filter((task) => task.status === "completed").length;
              const phaseProgress = phaseTasks.length ? Math.round((phaseDone / phaseTasks.length) * 100) : 0;
              return (
                <div key={phase} className="px-5 py-5">
                  <div className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#edf4ff] text-[9px] font-bold text-[#2f80ed]">{index + 1}</span><div><p className="truncate text-[11px] font-semibold text-[#334962]">{phase}</p><p className="mt-1 text-[8px] text-[#97a4b5]">{phaseDone} dari {phaseTasks.length} tugas selesai</p></div></div><span className="text-[10px] font-semibold text-[#52667f]">{phaseProgress}%</span></div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full bg-[#2f80ed]" style={{ width: `${phaseProgress}%` }} /></div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {phaseTasks.map((task) => <div key={task.id} className="flex items-center gap-2 text-[9px] text-[#6f8097]">{task.status === "completed" ? <CheckCircle2 size={12} className="text-[#45b68d]" /> : <Circle size={12} className="text-[#c2cad5]" />}<span className="truncate">{task.title}</span></div>)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="h-fit space-y-4">
          <section className="border border-[#e5ebf3] bg-white p-5"><h2 className="text-[11px] font-semibold">Detail pernikahan</h2><div className="mt-4 space-y-3 text-[9px] text-[#74859b]"><p className="flex items-start gap-2"><CalendarDays size={13} className="mt-0.5 text-[#2f80ed]" /><span><strong className="block text-[#40536d]">Tanggal</strong>{dateLabel}</span></p><p className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 text-[#2f80ed]" /><span><strong className="block text-[#40536d]">Venue</strong>{project?.venue || typedClient.venue || "Belum ditentukan"}</span></p></div></section>
          <section className="border border-[#e5ebf3] bg-white p-5"><h2 className="text-[11px] font-semibold">Kontak klien</h2><div className="mt-3 space-y-1.5 text-[9px] text-[#74859b]"><p>{typedClient.email}</p><p>{typedClient.phone || "Nomor belum tersedia"}</p><p className="pt-2 font-semibold text-[#40536d]">{typedClient.package_name || "Paket belum dipilih"}</p></div></section>
        </aside>
      </div>
    </div>
  );
}
