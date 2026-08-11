import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientTaskItem } from "@/components/client-task-item";
import { Sparkles, Target } from "lucide-react";

export default async function PortalTimeline() {
  const supabase = await createClient();
  if (!supabase) return <div>Database not connected</div>;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: clientData } = await supabase.from("clients").select("id").eq("profile_id", user.id).single();
  const { data: projects } = await supabase.from("projects").select("id").eq("client_id", clientData?.id || '00000000-0000-0000-0000-000000000000');
  const project = projects?.[0];

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, status")
    .eq("project_id", project?.id)
    .order("start_date", { ascending: true });

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === "completed").length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-8 lg:p-12 max-w-5xl">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#2d2a45]">Timeline Persiapan ✨</h1>
          <p className="mt-2 text-[#7a7698]">Mari selesaikan langkah-langkah menuju hari bahagiamu.</p>
        </div>
      </div>
      
      {/* Soft Premium Progress Block */}
      <div className="mb-12 overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl shadow-[#9796f0]/10 border border-[#f1e6ff] relative">
        <div className="absolute top-0 right-0 p-8 text-[#9796f0]/20 pointer-events-none">
          <Target size={120} strokeWidth={1} />
        </div>
        
        <div className="relative z-10 flex justify-between items-end mb-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#a39fbd] mb-2">Progres Keseluruhan</p>
            <h2 className="text-4xl font-black bg-gradient-to-r from-[#9796f0] to-[#fbc7d4] bg-clip-text text-transparent">
              {completedTasks} dari {totalTasks} tugas beres
            </h2>
          </div>
        </div>
        
        <div className="relative z-10 mt-8">
          <div className="flex justify-between text-sm font-bold text-[#7a7698] mb-3">
            <span>{progressPercent}% Selesai</span>
            <span>{100 - progressPercent}% Tersisa</span>
          </div>
          <div className="h-4 w-full rounded-full bg-[#f8f5ff] overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#9796f0] to-[#fbc7d4] transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-8 bg-white/50 p-1.5 rounded-full w-fit border border-[#f1e6ff] backdrop-blur-md">
        <button className="rounded-full bg-gradient-to-r from-[#9796f0] to-[#fbc7d4] text-white px-7 py-2.5 text-sm font-bold shadow-lg shadow-[#9796f0]/30 transition-transform hover:scale-105">
          Semua Tugas
        </button>
        <button className="rounded-full bg-transparent text-[#7a7698] px-7 py-2.5 text-sm font-semibold hover:bg-white hover:text-[#5a567c] transition-colors">
          Belum Selesai
        </button>
        <button className="rounded-full bg-transparent text-[#7a7698] px-7 py-2.5 text-sm font-semibold hover:bg-white hover:text-[#5a567c] transition-colors">
          Selesai
        </button>
      </div>

      {/* Task List Block */}
      <div className="mt-4 space-y-2 relative z-10">
        {tasks?.map((t) => (
          <ClientTaskItem 
            key={t.id}
            id={t.id}
            title={t.title}
            description={t.description || ""}
            status={t.status}
          />
        ))}
        {(!tasks || tasks.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-[#dcd8e6] bg-white/50 backdrop-blur-sm">
            <Sparkles size={40} className="text-[#fbc7d4] mb-4" />
            <h3 className="text-lg font-bold text-[#5a567c]">Belum ada tugas di timeline ini</h3>
            <p className="text-sm text-[#a39fbd] mt-2 max-w-sm">Daftar tugas akan muncul setelah tim Brides Beloved menyusun jadwal perencanaanmu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
