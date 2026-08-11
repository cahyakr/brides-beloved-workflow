import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Banknote, CircleDollarSign, CreditCard, PieChart, ReceiptText, WalletCards } from "lucide-react";
import { PortalPageHeader } from "@/components/portal-page-header";

type BudgetItem = {
  id: string;
  category: string;
  item_name: string;
  vendor_name: string | null;
  estimated_amount: number;
  actual_amount: number;
  paid_amount: number;
  payment_status: string;
  due_date: string | null;
};

const demoItems: BudgetItem[] = [
  { id: "b1", category: "Venue", item_name: "Venue & ballroom", vendor_name: "The Apurva Bali", estimated_amount: 150000000, actual_amount: 150000000, paid_amount: 75000000, payment_status: "pending", due_date: "2026-09-01" },
  { id: "b2", category: "Decoration", item_name: "Wedding decoration", vendor_name: "Bloom Atelier", estimated_amount: 85000000, actual_amount: 80000000, paid_amount: 25000000, payment_status: "pending", due_date: "2026-10-15" },
  { id: "b3", category: "Documentation", item_name: "Photo & cinematic video", vendor_name: "Evermore Films", estimated_amount: 45000000, actual_amount: 43000000, paid_amount: 43000000, payment_status: "paid", due_date: "2026-08-01" },
];

const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export default async function BudgetPage() {
  const supabase = await createClient();
  let target = 450000000;
  let items = demoItems;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data: client } = await supabase.from("clients").select("id").eq("profile_id", user.id).maybeSingle();
    const { data: project } = client ? await supabase.from("projects").select("id").eq("client_id", client.id).neq("status", "cancelled").order("created_at", { ascending: false }).limit(1).maybeSingle() : { data: null };
    const { data: budget } = project ? await supabase.from("budgets").select("id, target_amount, budget_items(id, category, item_name, vendor_name, estimated_amount, actual_amount, paid_amount, payment_status, due_date)").eq("project_id", project.id).maybeSingle() : { data: null };
    if (budget) {
      target = Number(budget.target_amount || 0);
      items = (budget.budget_items || []) as unknown as BudgetItem[];
    } else {
      target = 0;
      items = [];
    }
  }

  const estimated = items.reduce((sum, item) => sum + Number(item.estimated_amount), 0);
  const actual = items.reduce((sum, item) => sum + Number(item.actual_amount), 0);
  const paid = items.reduce((sum, item) => sum + Number(item.paid_amount), 0);
  const remaining = Math.max(0, actual - paid);
  const usage = target ? Math.min(100, Math.round((actual / target) * 100)) : 0;

  return (
    <div className="px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
      <PortalPageHeader icon={WalletCards} eyebrow="Wedding finance" title="Budget Pernikahan" description="Pantau rencana biaya, nilai kontrak, pembayaran, dan sisa tagihan dalam satu tampilan." />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Target budget", money.format(target), "Batas anggaran keseluruhan", CircleDollarSign, "#edf4ff", "#2869e8"],
          ["Estimasi", money.format(estimated), `${usage}% dari target`, PieChart, "#f7efff", "#8b65c7"],
          ["Sudah dibayar", money.format(paid), `${items.filter((item) => item.payment_status === "paid").length} item lunas`, CreditCard, "#eef9f5", "#44a982"],
          ["Sisa tagihan", money.format(remaining), "Belum dibayarkan", Banknote, "#fff5e5", "#d39734"],
        ].map(([label, value, note, Icon, background, color]) => (
          <section key={String(label)} className="rounded-2xl border border-[#e1e7ef] bg-white p-5 shadow-[0_6px_24px_rgba(37,55,85,.035)]">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[9px] font-semibold text-[#8e9bad]">{String(label)}</p><p className="mt-3 truncate text-[17px] font-semibold tracking-[-.03em] text-[#243550]">{String(value)}</p></div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: String(background), color: String(color) }}><Icon size={16} /></span></div>
            <p className="mt-3 text-[8px] text-[#a0aaba]">{String(note)}</p>
          </section>
        ))}
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#e1e7ef] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#e9edf3] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="flex items-center gap-2 text-[12px] font-semibold text-[#2b3c56]"><ReceiptText size={15} className="text-[#2869e8]" />Rincian pengeluaran</h2><p className="mt-1 text-[8px] text-[#98a4b5]">Nilai diperbarui oleh wedding planner sesuai kontrak vendor.</p></div>
          <div className="w-full max-w-[220px]"><div className="mb-1.5 flex justify-between text-[8px] text-[#8795a8]"><span>Penggunaan anggaran</span><span>{usage}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full bg-[#2869e8]" style={{ width: `${usage}%` }} /></div></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[790px] text-left">
            <thead className="bg-[#fafbfd] text-[8px] uppercase tracking-[.1em] text-[#96a2b3]"><tr>{["Item", "Vendor", "Estimasi", "Aktual", "Dibayar", "Status"].map((heading) => <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-[#edf1f5]">
              {items.map((item) => <tr key={item.id} className="text-[9px]"><td className="px-5 py-4"><p className="font-semibold text-[#40516a]">{item.item_name}</p><p className="mt-1 text-[8px] text-[#9aa5b5]">{item.category}</p></td><td className="px-5 py-4 text-[#748399]">{item.vendor_name || "—"}</td><td className="px-5 py-4 text-[#748399]">{money.format(item.estimated_amount)}</td><td className="px-5 py-4 font-semibold text-[#40516a]">{money.format(item.actual_amount)}</td><td className="px-5 py-4 text-[#748399]">{money.format(item.paid_amount)}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 font-semibold ${item.payment_status === "paid" ? "bg-[#eaf8f2] text-[#3e9a77]" : "bg-[#fff5e8] text-[#c28532]"}`}>{item.payment_status === "paid" ? "Lunas" : "Berjalan"}</span></td></tr>)}
            </tbody>
          </table>
        </div>
        {!items.length && <div className="px-6 py-14 text-center"><ReceiptText className="mx-auto text-[#a5b3c5]" size={28} /><p className="mt-3 text-[11px] font-semibold text-[#53647b]">Budget belum disusun</p><p className="mt-1 text-[9px] text-[#9aa6b6]">Wedding planner akan menambahkan rincian biaya setelah sesi budgeting.</p></div>}
      </section>
    </div>
  );
}
