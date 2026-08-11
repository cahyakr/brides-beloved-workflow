import { PageTitle } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { AddLeadModal } from "@/components/forms/add-lead-modal";

export default async function Leads() {
  const supabase = await createClient();
  const { data: leads } = supabase ? await supabase.from("leads").select("*").order("created_at", { ascending: false }) : { data: [] };

  return (
    <div className="px-5 py-7 lg:px-8">
      <PageTitle eyebrow="Sales Pipeline" title="Leads">
        <AddLeadModal />
      </PageTitle>
      
      <div className="mt-8 grid gap-3 xl:grid-cols-4">
        {["new", "contacted", "consultation", "proposal"].map(s => {
          const groupLeads = (leads || []).filter(x => x.status === s);
          return (
            <section key={s} className="min-h-72 rounded-lg bg-[#f7f9fc] p-3">
              <div className="flex items-center justify-between px-1 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#6f819a]">{s}</p>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white text-[9px] text-[#8191a8]">{groupLeads.length}</span>
              </div>
              
              {groupLeads.length === 0 && (
                <div className="mt-2 p-4 text-center text-[10px] text-[#9caabf]">Tidak ada prospek</div>
              )}
              
              {groupLeads.map(l => (
                <div key={l.id} className="mt-2 border border-[#e5eaf1] bg-white p-4">
                  <p className="text-xs font-semibold">{l.bride_name} & {l.groom_name}</p>
                  <p className="mt-2 text-[9px] text-[#8b9ab0]">Wedding · {l.wedding_date ? new Date(l.wedding_date).toLocaleDateString("id-ID", { month: "short", year: "numeric" }) : "TBD"}</p>
                  <button className="mt-4 text-[9px] font-semibold text-[#2f80ed]">Open lead →</button>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
