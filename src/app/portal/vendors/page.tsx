import { PortalPageHeader } from "@/components/portal-page-header";
import { createClient } from "@/lib/supabase/server";
import { AtSign, BadgeCheck, CircleDollarSign, Mail, Phone, Search, Store, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";

type Vendor = { id: string; name: string; category: string; contact_name: string | null; phone: string | null; email: string | null; instagram: string | null; contract_value: number | null; status: string; notes: string | null };

const demoVendors: Vendor[] = [
  { id: "v1", name: "Bloom Atelier", category: "Decoration", contact_name: "Nadia", phone: "0812 0000 0001", email: "hello@bloomatelier.id", instagram: "@bloomatelier", contract_value: 80000000, status: "booked", notes: "Final concept approved" },
  { id: "v2", name: "Evermore Films", category: "Documentation", contact_name: "Raka", phone: "0812 0000 0002", email: "team@evermorefilms.id", instagram: "@evermorefilms", contract_value: 43000000, status: "shortlisted", notes: "Waiting final package" },
  { id: "v3", name: "Maison Bridal", category: "Attire", contact_name: "Clarissa", phone: "0812 0000 0003", email: "studio@maisonbridal.id", instagram: "@maisonbridal", contract_value: 35000000, status: "booked", notes: "Second fitting in September" },
];

const money = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const statusLabel: Record<string, string> = { shortlisted: "Shortlist", contacted: "Dihubungi", booked: "Booked", completed: "Selesai", cancelled: "Batal" };

export default async function VendorsPage() {
  const supabase = await createClient();
  let vendors = demoVendors;
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data: client } = await supabase.from("clients").select("id").eq("profile_id", user.id).maybeSingle();
    const { data: project } = client ? await supabase.from("projects").select("id").eq("client_id", client.id).neq("status", "cancelled").order("created_at", { ascending: false }).limit(1).maybeSingle() : { data: null };
    const { data } = project ? await supabase.from("vendors").select("id, name, category, contact_name, phone, email, instagram, contract_value, status, notes").eq("project_id", project.id).eq("visible_to_client", true).order("category") : { data: [] };
    vendors = (data || []) as Vendor[];
  }

  const booked = vendors.filter((vendor) => ["booked", "completed"].includes(vendor.status)).length;
  const categories = new Set(vendors.map((vendor) => vendor.category)).size;
  const contractValue = vendors.filter((vendor) => ["booked", "completed"].includes(vendor.status)).reduce((sum, vendor) => sum + Number(vendor.contract_value || 0), 0);
  const stats: Array<[string, string | number, string, LucideIcon, string, string]> = [
    ["Total vendor", vendors.length, "Semua kandidat dan partner", Store, "#edf4ff", "#2869e8"],
    ["Sudah booked", booked, `${categories} kategori terisi`, BadgeCheck, "#eef9f5", "#44a982"],
    ["Nilai kontrak", money.format(contractValue), "Vendor berstatus booked", CircleDollarSign, "#fff5e5", "#d39734"],
  ];

  return (
    <div className="px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
      <PortalPageHeader icon={Store} eyebrow="Vendor directory" title="Vendor Pernikahan" description="Lihat vendor yang dipertimbangkan, sudah di-booking, kontak PIC, dan nilai kontraknya." />

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {stats.map(([label, value, note, Icon, background, color]) => <section key={label} className="rounded-2xl border border-[#e1e7ef] bg-white p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[9px] text-[#8e9bad]">{label}</p><p className="mt-2 truncate text-[20px] font-semibold text-[#253650]">{value}</p></div><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background, color }}><Icon size={16} /></span></div><p className="mt-2 text-[8px] text-[#a0aaba]">{note}</p></section>)}
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-[#e1e7ef] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#e9edf3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-[12px] font-semibold text-[#2b3c56]">Directory vendor</h2><p className="mt-1 text-[8px] text-[#98a4b5]">Hubungi PIC vendor melalui informasi yang tersedia.</p></div><label className="flex h-9 w-full max-w-[240px] items-center gap-2 rounded-lg border border-[#dfe5ed] px-3 text-[#96a2b4]"><Search size={13} /><input placeholder="Cari vendor..." className="w-full text-[9px] outline-none" /></label></div>
        <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">
          {vendors.map((vendor, index) => (
            <article key={vendor.id} className="rounded-2xl border border-[#e4e9f1] p-5 transition hover:-translate-y-0.5 hover:border-[#c9d7ed] hover:shadow-[0_10px_28px_rgba(37,55,85,.06)]">
              <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[11px] font-bold text-[#4e6688]" style={{ background: ["#e7efff", "#f6eaf1", "#e5f6f0"][index % 3] }}>{vendor.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold text-[#354760]">{vendor.name}</p><p className="mt-1 text-[8px] text-[#8f9daf]">{vendor.category}</p></div><span className={`rounded-full px-2.5 py-1 text-[8px] font-semibold ${vendor.status === "booked" || vendor.status === "completed" ? "bg-[#eaf8f2] text-[#3f9473]" : "bg-[#fff5e8] text-[#b98132]"}`}>{statusLabel[vendor.status] || vendor.status}</span></div>
              <div className="mt-5 space-y-2.5 border-t border-[#edf1f5] pt-4 text-[8px] text-[#7f8da1]"><p className="flex items-center gap-2"><UsersRound size={12} className="text-[#8aa0c0]" />{vendor.contact_name || "PIC belum ditentukan"}</p>{vendor.phone && <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 hover:text-[#2869e8]"><Phone size={12} className="text-[#8aa0c0]" />{vendor.phone}</a>}{vendor.email && <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 truncate hover:text-[#2869e8]"><Mail size={12} className="text-[#8aa0c0]" />{vendor.email}</a>}{vendor.instagram && <p className="flex items-center gap-2"><AtSign size={12} className="text-[#8aa0c0]" />{vendor.instagram}</p>}</div>
              <div className="mt-4 flex items-end justify-between border-t border-[#edf1f5] pt-4"><div><p className="text-[7px] uppercase tracking-[.1em] text-[#a2adbc]">Nilai kontrak</p><p className="mt-1 text-[10px] font-semibold text-[#40516a]">{vendor.contract_value ? money.format(vendor.contract_value) : "Belum tersedia"}</p></div>{vendor.notes && <span title={vendor.notes} className="max-w-[120px] truncate text-[8px] text-[#98a4b5]">{vendor.notes}</span>}</div>
            </article>
          ))}
        </div>
        {!vendors.length && <div className="px-6 py-16 text-center"><Store className="mx-auto text-[#a5b3c5]" size={30} /><p className="mt-3 text-[11px] font-semibold text-[#53647b]">Vendor belum ditambahkan</p><p className="mt-1 text-[9px] text-[#9aa6b6]">Wedding planner akan menambahkan shortlist vendor setelah diskusi konsep.</p></div>}
      </section>
    </div>
  );
}
