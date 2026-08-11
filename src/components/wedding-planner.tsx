"use client";

import { completeClientTask } from "@/lib/actions";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";

export type PlannerTask = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignees: string[];
  clientCanComplete: boolean;
};

export type PlannerActivity = {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: "blue" | "green" | "amber";
};

type Props = {
  coupleName: string;
  weddingDate: string | null;
  venue: string;
  tasks: PlannerTask[];
  activities: PlannerActivity[];
  today: string;
};

const phaseColors = ["#6f7cf7", "#efb743", "#50cfa1", "#51b7d9", "#f17d88"];

function dateLabel(value: string | null) {
  if (!value) return "Belum dijadwalkan";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function initials(name: string) {
  return name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

export function WeddingPlanner({ coupleName, weddingDate, venue, tasks: initialTasks, activities, today }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<"all" | "open" | "completed">("all");
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const completed = tasks.filter((task) => task.status === "completed").length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const phases = useMemo(() => Array.from(new Set(tasks.map((task) => task.category || "Persiapan Umum"))), [tasks]);
  const visibleTasks = tasks.filter((task) => {
    if (activePhase && task.category !== activePhase) return false;
    if (filter === "open") return task.status !== "completed";
    if (filter === "completed") return task.status === "completed";
    return true;
  });

  function toggleTask(task: PlannerTask) {
    if (!task.clientCanComplete || pending) return;
    const nextStatus = task.status === "completed" ? "not_started" : "completed";
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item));
    const formData = new FormData();
    formData.set("id", task.id);
    formData.set("status", nextStatus);
    startTransition(async () => {
      const result = await completeClientTask(formData);
      if (result?.error) {
        setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: task.status } : item));
      }
    });
  }

  const nextTasks = tasks.filter((task) => task.status !== "completed").slice(0, 3);
  const eventDate = weddingDate ? new Date(`${weddingDate}T00:00:00`) : null;
  const daysLeft = eventDate ? Math.max(0, Math.ceil((eventDate.getTime() - new Date(`${today}T00:00:00`).getTime()) / 86400000)) : null;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-7 lg:py-7">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.16em] text-[#97a3b6]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#51cda1]" /> Wedding workspace
          </div>
          <h1 className="text-[26px] font-semibold tracking-[-.04em] text-[#17233d] sm:text-[31px]">Timeline {coupleName}</h1>
          <p className="mt-1.5 text-[11px] text-[#8190a6]">{dateLabel(weddingDate)} <span className="mx-2 text-[#ccd3dd]">•</span> {venue}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe5ee] bg-white px-3.5 text-[10px] font-semibold text-[#5a6b84] shadow-sm">
            <Users size={14} /> Tim perencana <ChevronDown size={12} />
          </button>
          <button type="button" className="flex h-9 items-center gap-2 rounded-lg bg-[#2869e8] px-4 text-[10px] font-semibold text-white shadow-[0_8px_20px_rgba(40,105,232,.22)]">
            <Plus size={14} /> Ajukan tugas
          </button>
        </div>
      </div>

      <section className="mb-5 rounded-2xl border border-[#e1e7f0] bg-white p-5 shadow-[0_8px_30px_rgba(38,56,86,.04)] sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#9aa6b8]">Progres persiapan</p>
            <p className="mt-2 text-[24px] font-semibold tracking-[-.04em] text-[#1d2b45]">{completed} dari {tasks.length} tugas selesai</p>
            <p className="mt-1 text-[10px] text-[#8794a8]">{daysLeft === null ? "Tanggal pernikahan belum ditentukan" : `${daysLeft} hari lagi menuju hari bahagia`}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right"><p className="text-[24px] font-semibold text-[#2869e8]">{progress}%</p><p className="text-[9px] text-[#98a4b6]">keseluruhan</p></div>
            <div className="relative grid h-14 w-14 place-items-center rounded-full" style={{ background: `conic-gradient(#2869e8 ${progress * 3.6}deg, #edf1f6 0deg)` }}>
              <div className="h-10 w-10 rounded-full bg-white" />
            </div>
          </div>
        </div>
        <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-[#edf1f6]">
          {phases.map((phase, index) => {
            const phaseTasks = tasks.filter((task) => task.category === phase);
            const done = phaseTasks.filter((task) => task.status === "completed").length;
            const width = tasks.length ? (phaseTasks.length / tasks.length) * 100 : 0;
            const fill = phaseTasks.length ? (done / phaseTasks.length) * 100 : 0;
            return <div key={phase} className="h-full border-r border-white/70 last:border-0" style={{ width: `${width}%`, background: `linear-gradient(to right, ${phaseColors[index % phaseColors.length]} ${fill}%, #edf1f6 ${fill}%)` }} />;
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[190px_minmax(420px,1fr)_286px]">
        <aside className="rounded-2xl border border-[#e2e7ef] bg-white p-3.5 xl:sticky xl:top-[94px] xl:h-fit">
          <div className="flex items-center justify-between px-2 py-2">
            <h2 className="text-[11px] font-semibold text-[#263650]">Tahapan</h2>
            <span className="rounded-full bg-[#f1f4f8] px-2 py-0.5 text-[8px] font-semibold text-[#7f8da1]">{phases.length}</span>
          </div>
          <button type="button" onClick={() => setActivePhase(null)} className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-[10px] font-semibold transition ${!activePhase ? "bg-[#edf4ff] text-[#2869d7]" : "text-[#6f7e93] hover:bg-[#f7f9fc]"}`}>
            Semua tahapan <span>{tasks.length}</span>
          </button>
          <div className="mt-1 space-y-1">
            {phases.map((phase, index) => {
              const phaseTasks = tasks.filter((task) => task.category === phase);
              const done = phaseTasks.filter((task) => task.status === "completed").length;
              return (
                <button key={phase} type="button" onClick={() => setActivePhase(phase)} className={`w-full rounded-xl px-3 py-3 text-left transition ${activePhase === phase ? "bg-[#f6f8fc]" : "hover:bg-[#f8fafd]"}`}>
                  <span className="flex items-start gap-2.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: phaseColors[index % phaseColors.length] }} />
                    <span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold text-[#41516a]">{phase.replace(/^Fase \d+\s*-\s*/, "")}</span><span className="mt-1 block text-[8px] text-[#9aa6b7]">{done}/{phaseTasks.length} selesai</span></span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-lg border border-[#e0e5ed] bg-white p-1">
              {(["all", "open", "completed"] as const).map((value) => (
                <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-md px-3 py-1.5 text-[9px] font-semibold transition ${filter === value ? "bg-[#253b60] text-white" : "text-[#7b899d] hover:bg-[#f4f6f9]"}`}>
                  {value === "all" ? "Semua" : value === "open" ? "Belum selesai" : "Selesai"}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-[#98a4b5]">{visibleTasks.length} tugas ditampilkan</p>
          </div>

          <div className="space-y-3">
            {visibleTasks.map((task) => {
              const isDone = task.status === "completed";
              return (
                <article key={task.id} className={`group rounded-2xl border bg-white p-4 shadow-[0_5px_20px_rgba(37,55,85,.035)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(37,55,85,.07)] sm:p-5 ${isDone ? "border-[#dcefe8]" : "border-[#e1e6ee]"}`}>
                  <div className="flex items-start gap-3.5">
                    <button type="button" onClick={() => toggleTask(task)} disabled={!task.clientCanComplete || pending} aria-label={isDone ? `Tandai ${task.title} belum selesai` : `Tandai ${task.title} selesai`} title={!task.clientCanComplete ? "Status tugas ini diperbarui oleh wedding planner" : undefined} className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${isDone ? "border-[#50cfa1] bg-[#50cfa1] text-white" : task.clientCanComplete ? "border-[#cbd3df] bg-white hover:border-[#6c8fe9]" : "cursor-not-allowed border-[#e0e5ec] bg-[#f3f5f8]"}`}>
                      {isDone && <Check size={12} strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full px-2 py-0.5 text-[8px] font-bold" style={{ color: phaseColors[phases.indexOf(task.category) % phaseColors.length], background: `${phaseColors[phases.indexOf(task.category) % phaseColors.length]}15` }}>Fase {Math.max(1, phases.indexOf(task.category) + 1)}</span>
                            {task.priority === "high" || task.priority === "urgent" ? <span className="rounded-full bg-[#fff1ed] px-2 py-0.5 text-[8px] font-semibold text-[#d16a55]">Prioritas</span> : null}
                          </div>
                          <h3 className={`mt-2 text-[13px] font-semibold leading-snug ${isDone ? "text-[#92a0b3] line-through" : "text-[#253650]"}`}>{task.title}</h3>
                        </div>
                        <button type="button" aria-label="Opsi tugas" className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#9aa6b7] hover:bg-[#f4f6f9]"><MoreHorizontal size={15} /></button>
                      </div>
                      <p className={`mt-1.5 line-clamp-2 text-[10px] leading-relaxed ${isDone ? "text-[#b2bcc9]" : "text-[#7c8a9f]"}`}>{task.description || "Detail tugas akan dilengkapi oleh tim wedding planner."}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] text-[#8d99aa]">
                        <span className="flex items-center gap-1.5"><CalendarDays size={12} />{dateLabel(task.dueDate)}</span>
                        <span className="flex items-center gap-1.5"><MessageCircle size={12} />0 komentar</span>
                        <div className="ml-auto flex -space-x-1.5">
                          {(task.assignees.length ? task.assignees : ["Brides Beloved"]).slice(0, 3).map((name, avatarIndex) => (
                            <span key={`${name}-${avatarIndex}`} title={name} className="grid h-6 w-6 place-items-center rounded-full border-2 border-white text-[7px] font-bold text-[#52637c]" style={{ background: ["#e4edff", "#f8e9f0", "#e3f6ef"][avatarIndex % 3] }}>{initials(name)}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
            {visibleTasks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#d8dee8] bg-white px-6 py-14 text-center">
                <Sparkles className="mx-auto text-[#8da8e7]" size={28} />
                <p className="mt-3 text-[12px] font-semibold text-[#43536b]">Tidak ada tugas pada filter ini</p>
                <p className="mt-1 text-[9px] text-[#98a4b5]">Pilih tahapan atau status yang lain.</p>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-[94px] xl:h-fit">
          <section className="rounded-2xl border border-[#e1e7ef] bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="text-[11px] font-semibold text-[#2a3a53]">Aktivitas terbaru</h2><MoreHorizontal size={15} className="text-[#9aa6b6]" /></div>
            <div className="mt-4 space-y-4">
              {activities.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${activity.tone === "green" ? "bg-[#4dcea0]" : activity.tone === "amber" ? "bg-[#efb743]" : "bg-[#5d84ef]"}`} />
                  <div><p className="text-[9px] font-semibold text-[#40516a]">{activity.title}</p><p className="mt-1 text-[8px] leading-relaxed text-[#8f9bad]">{activity.description}</p><p className="mt-1 text-[8px] text-[#b0b9c6]">{activity.time}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#e1e7ef] bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="text-[11px] font-semibold text-[#2a3a53]">Checklist terdekat</h2><span className="rounded-full bg-[#f1f4f8] px-2 py-0.5 text-[8px] text-[#7e8c9f]">{nextTasks.length}</span></div>
            <div className="mt-4 space-y-2.5">
              {nextTasks.map((task) => (
                <button key={task.id} type="button" onClick={() => toggleTask(task)} disabled={!task.clientCanComplete || pending} className="flex w-full items-center gap-2.5 rounded-xl border border-[#e8ecf2] px-3 py-3 text-left transition hover:border-[#cbd8ef] disabled:cursor-default">
                  <span className="h-4 w-4 shrink-0 rounded border border-[#c9d2df]" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-[9px] font-semibold text-[#44546c]">{task.title}</span><span className="mt-1 flex items-center gap-1 text-[8px] text-[#9aa6b7]"><Clock3 size={10} />{dateLabel(task.dueDate)}</span></span>
                </button>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl bg-[#263d63] p-5 text-white shadow-[0_12px_30px_rgba(38,61,99,.18)]">
            <div className="flex items-center gap-2 text-[#a9c3f5]"><CheckCircle2 size={15} /><span className="text-[9px] font-bold uppercase tracking-[.12em]">On track</span></div>
            <p className="mt-3 text-[13px] font-semibold">Persiapan berjalan baik</p>
            <p className="mt-1.5 text-[9px] leading-relaxed text-white/65">Tim Brides Beloved akan menghubungi kamu bila ada keputusan yang perlu dikonfirmasi.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
