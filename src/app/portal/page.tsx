import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const SERVER_START_TIME = new Date().getTime();

export default async function PortalDashboard() {
  const supabase = await createClient();
  let coupleName = "Sarah & Daniel";
  let venue = "The Apurva Bali";
  let weddingDate: string | null = "2026-12-24";
  let tasks = [
    { id: "1", title: "Pilih attire, makeup & food tasting", due_date: "2026-08-27", status: "in_progress" },
    { id: "2", title: "Review draft rundown acara", due_date: "2026-09-12", status: "not_started" },
    { id: "3", title: "Final fitting & konsep dekorasi", due_date: "2026-09-30", status: "not_started" },
  ];
  let total = 8;
  let completed = 2;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data: client } = await supabase.from("clients").select("id, display_name, wedding_date, venue").eq("profile_id", user.id).single();
    if (client) {
      coupleName = client.display_name;
      venue = client.venue || "Venue belum ditentukan";
      weddingDate = client.wedding_date;
      const { data: project } = await supabase.from("projects").select("id, event_date, venue").eq("client_id", client.id).neq("status", "cancelled").order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (project) {
        weddingDate = project.event_date || weddingDate;
        venue = project.venue || venue;
        const { data: dbTasks } = await supabase.from("tasks").select("id, title, due_date, status").eq("project_id", project.id).eq("visible_to_client", true).order("due_date");
        if (dbTasks) {
          total = dbTasks.length;
          completed = dbTasks.filter((task) => task.status === "completed").length;
          tasks = dbTasks.filter((task) => task.status !== "completed").slice(0, 3);
        }
      }
    }
  }

  const progress = total ? Math.round((completed / total) * 100) : 0;
  const daysLeft = weddingDate ? Math.max(0, Math.ceil((new Date(`${weddingDate}T00:00:00`).getTime() - SERVER_START_TIME) / 86400000)) : null;
  const weddingDateLabel = weddingDate ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${weddingDate}T00:00:00`)) : "Belum ditentukan";

  return (
    <div className="px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[.17em] text-[#98a4b6]">Client dashboard</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-[-.04em] text-[#17233d]">Halo, {coupleName} 👋</h1>
          <p className="mt-1.5 text-[11px] text-[#8190a6]">Semua detail persiapan hari bahagia dalam satu tempat.</p>
        </div>
        <Link href="/portal/timeline" className="flex h-10 w-fit items-center gap-2 rounded-lg bg-[#2869e8] px-4 text-[10px] font-semibold text-white shadow-[0_8px_20px_rgba(40,105,232,.2)]">Buka wedding planner <ArrowRight size={14} /></Link>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Progres", `${progress}%`, `${completed} dari ${total} tugas selesai`, CheckCircle2, "#edf4ff", "#2869e8"],
          ["Menuju hari H", daysLeft === null ? "—" : `${daysLeft} hari`, weddingDateLabel, Clock3, "#fff5e5", "#d39734"],
          ["Venue", venue, "Lokasi pernikahan", MapPin, "#eef9f5", "#44a982"],
          ["Pesan tim", "3 update", "Aktivitas minggu ini", MessageCircle, "#f7efff", "#8b65c7"],
        ].map(([label, value, note, Icon, background, color]) => (
          <section key={String(label)} className="rounded-2xl border border-[#e2e7ef] bg-white p-5 shadow-[0_6px_24px_rgba(37,55,85,.035)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="text-[9px] font-semibold text-[#8e9bad]">{String(label)}</p><p className="mt-3 truncate text-[19px] font-semibold tracking-[-.03em] text-[#243550]">{String(value)}</p></div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: String(background), color: String(color) }}><Icon size={16} /></span>
            </div>
            <p className="mt-3 truncate text-[8px] text-[#a0aaba]">{String(note)}</p>
          </section>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_.6fr]">
        <section className="overflow-hidden rounded-2xl border border-[#e1e7ef] bg-white">
          <div className="flex items-center justify-between border-b border-[#edf1f5] px-5 py-4">
            <div><h2 className="text-[12px] font-semibold text-[#263750]">Fokus berikutnya</h2><p className="mt-1 text-[9px] text-[#98a4b6]">Tugas terdekat yang perlu diperhatikan</p></div>
            <Link href="/portal/timeline" className="text-[9px] font-semibold text-[#2869e8]">Lihat semua</Link>
          </div>
          <div className="divide-y divide-[#edf1f5]">
            {tasks.map((task, index) => (
              <div key={task.id} className="flex items-center gap-3 px-5 py-4">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[9px] font-bold ${index === 0 ? "bg-[#edf4ff] text-[#2869e8]" : "bg-[#f4f6f9] text-[#7c899c]"}`}>{String(index + 1).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-[#3a4b64]">{task.title}</p><p className="mt-1 flex items-center gap-1 text-[8px] text-[#98a4b5]"><CalendarDays size={10} />{task.due_date ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(new Date(`${task.due_date}T00:00:00`)) : "Belum dijadwalkan"}</p></div>
                <span className="rounded-full bg-[#fff5e8] px-2 py-1 text-[8px] font-semibold text-[#c68730]">{task.status === "in_progress" ? "Berjalan" : "Terjadwal"}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-2xl bg-[#263d63] p-6 text-white shadow-[0_12px_35px_rgba(38,61,99,.17)]">
          <Sparkles className="absolute -right-5 -top-5 text-white/10" size={120} />
          <p className="text-[9px] font-bold uppercase tracking-[.15em] text-[#a9c3f5]">Brides Beloved note</p>
          <h2 className="mt-4 max-w-xs text-[21px] font-semibold leading-tight tracking-[-.03em]">Nikmati prosesnya, kami menjaga detailnya.</h2>
          <p className="mt-3 max-w-sm text-[10px] leading-relaxed text-white/65">Wedding planner kamu akan memperbarui timeline setelah setiap meeting dan keputusan vendor.</p>
          <Link href="/portal/timeline" className="mt-6 inline-flex items-center gap-2 text-[9px] font-semibold text-white">Lihat progres lengkap <ArrowRight size={13} /></Link>
        </section>
      </div>
    </div>
  );
}
