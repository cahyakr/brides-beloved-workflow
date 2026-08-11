import { WeddingPlanner, type PlannerActivity, type PlannerTask } from "@/components/wedding-planner";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const demoTasks: PlannerTask[] = [
  { id: "demo-1", title: "Meeting brainstorming & wedding direction", description: "Samakan visi acara, mood, prioritas, dan pengalaman tamu bersama wedding planner.", category: "Fase 1 - Wedding Direction", status: "completed", priority: "high", dueDate: "2026-06-15", assignees: ["Maya Putri", "Rani Aulia"], clientCanComplete: true },
  { id: "demo-2", title: "Konfirmasi budget utama", description: "Setujui alokasi awal venue, catering, dekorasi, dokumentasi, dan entertainment.", category: "Fase 1 - Wedding Direction", status: "completed", priority: "high", dueDate: "2026-06-22", assignees: ["Maya Putri"], clientCanComplete: true },
  { id: "demo-3", title: "Shortlist vendor & visit venue", description: "Tinjau proposal vendor utama serta hasil kunjungan lokasi acara.", category: "Fase 2 - Vendor Selection", status: "in_progress", priority: "high", dueDate: "2026-08-18", assignees: ["Rani Aulia", "Dimas Ardi"], clientCanComplete: false },
  { id: "demo-4", title: "Pilih attire, makeup & food tasting", description: "Konfirmasi pilihan busana, makeup artist, dan menu hasil sesi food tasting.", category: "Fase 2 - Vendor Selection", status: "not_started", priority: "medium", dueDate: "2026-08-27", assignees: ["Maya Putri"], clientCanComplete: true },
  { id: "demo-5", title: "Review draft rundown acara", description: "Periksa susunan seremoni, resepsi, entertainment, serta momen keluarga.", category: "Fase 3 - Detail Planning", status: "not_started", priority: "high", dueDate: "2026-09-12", assignees: ["Dimas Ardi", "Maya Putri"], clientCanComplete: true },
  { id: "demo-6", title: "Final fitting & konsep dekorasi", description: "Kunci hasil fitting terakhir dan detail eksekusi dekorasi bersama vendor.", category: "Fase 3 - Detail Planning", status: "not_started", priority: "medium", dueDate: "2026-09-30", assignees: ["Rani Aulia"], clientCanComplete: false },
  { id: "demo-7", title: "Final technical meeting", description: "Finalisasi rundown, floor plan, PIC, cue acara, serta alur seluruh vendor.", category: "Fase 4 - Finalization", status: "not_started", priority: "urgent", dueDate: "2026-11-15", assignees: ["Maya Putri", "Dimas Ardi"], clientCanComplete: false },
  { id: "demo-8", title: "Wedding day execution", description: "Koordinasi penuh seluruh rangkaian acara oleh tim Brides Beloved.", category: "Fase 5 - Wedding Day", status: "not_started", priority: "urgent", dueDate: "2026-12-24", assignees: ["Maya Putri", "Rani Aulia", "Dimas Ardi"], clientCanComplete: false },
];

const demoActivities: PlannerActivity[] = [
  { id: "a1", title: "Status tugas diperbarui", description: "Konfirmasi budget utama ditandai selesai.", time: "Hari ini, 09.42", tone: "green" },
  { id: "a2", title: "Catatan dari Maya", description: "Proposal vendor dekorasi sudah tersedia untuk direview.", time: "Kemarin, 16.10", tone: "blue" },
  { id: "a3", title: "Deadline mendekat", description: "Food tasting dijadwalkan minggu ini.", time: "2 hari lalu", tone: "amber" },
];

type DbTask = {
  id: string; title: string; description: string | null; category: string | null; status: string; priority: string; due_date: string | null; client_can_complete: boolean;
  task_assignees: Array<{ profiles: { full_name: string } | null }>;
};
type DbActivity = { id: string; action: string; metadata: { task_title?: string } | null; created_at: string; profiles: { full_name: string } | null };
const SERVER_TODAY = new Date().toISOString().slice(0, 10);

export default async function PortalTimeline() {
  const supabase = await createClient();
  if (!supabase) {
    return <WeddingPlanner projectId={undefined} coupleName="Sarah & Daniel" weddingDate="2026-12-24" venue="The Apurva Bali" tasks={demoTasks} activities={demoActivities} today={SERVER_TODAY} />;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client } = await supabase.from("clients").select("id, display_name, wedding_date, venue").eq("profile_id", user.id).single();
  if (!client) return <WeddingPlanner projectId={undefined} coupleName="Wedding Client" weddingDate={null} venue="Venue belum ditentukan" tasks={[]} activities={[]} today={SERVER_TODAY} />;

  const { data: project } = await supabase.from("projects").select("id, event_date, venue").eq("client_id", client.id).neq("status", "cancelled").order("created_at", { ascending: false }).limit(1).maybeSingle();
  const projectId = project?.id;

  const [{ data: dbTasks }, { data: dbActivities }] = await Promise.all([
    projectId ? supabase.from("tasks").select(`id, title, description, category, status, priority, due_date, client_can_complete, task_assignees(profiles(full_name))`).eq("project_id", projectId).eq("visible_to_client", true).order("sort_order").order("due_date") : Promise.resolve({ data: [] }),
    projectId ? supabase.from("task_activities").select("id, action, metadata, created_at, profiles(full_name)").eq("project_id", projectId).order("created_at", { ascending: false }).limit(6) : Promise.resolve({ data: [] }),
  ]);

  const tasks: PlannerTask[] = ((dbTasks || []) as unknown as DbTask[]).map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description || "",
    category: task.category || "Persiapan Umum",
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date,
    clientCanComplete: Boolean(task.client_can_complete),
    assignees: (task.task_assignees || []).map((item) => item.profiles?.full_name).filter((name): name is string => Boolean(name)),
  }));

  const activities: PlannerActivity[] = ((dbActivities || []) as unknown as DbActivity[]).map((activity) => ({
    id: activity.id,
    title: activity.action === "completed" ? "Tugas diselesaikan" : "Status tugas diperbarui",
    description: activity.metadata?.task_title || activity.profiles?.full_name || "Aktivitas wedding planner",
    time: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(activity.created_at)),
    tone: activity.action === "completed" ? "green" : "blue",
  }));

  return (
    <WeddingPlanner
      projectId={projectId}
      coupleName={client.display_name}
      weddingDate={project?.event_date || client.wedding_date}
      venue={project?.venue || client.venue || "Venue belum ditentukan"}
      tasks={tasks}
      activities={activities.length ? activities : demoActivities}
      today={SERVER_TODAY}
    />
  );
}
