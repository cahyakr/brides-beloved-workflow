import { PortalPageHeader } from "@/components/portal-page-header";
import { createGuest, deleteGuest, updateGuestStatus } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Clock3, Search, Trash2, UserPlus, Users, UserX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";

type Guest = { id: string; name: string; phone: string | null; guest_group: string | null; pax: number; table_name: string | null; status: string };

const demoGuests: Guest[] = [
  { id: "g1", name: "Budi & Keluarga", phone: "0812 3456 7890", guest_group: "Keluarga Pengantin Wanita", pax: 4, table_name: "A1", status: "confirmed" },
  { id: "g2", name: "Nadia Putri", phone: "0813 2200 1188", guest_group: "Sahabat", pax: 2, table_name: "B4", status: "invited" },
  { id: "g3", name: "Raka Pratama", phone: "0857 9000 2211", guest_group: "Rekan kerja", pax: 1, table_name: null, status: "declined" },
  { id: "g4", name: "Keluarga Hartono", phone: "0819 4433 1000", guest_group: "Keluarga Pengantin Pria", pax: 5, table_name: "A2", status: "confirmed" },
];

const statusLabel: Record<string, string> = { invited: "Diundang", confirmed: "Hadir", declined: "Tidak hadir", attended: "Sudah datang" };

export default async function GuestsPage() {
  const supabase = await createClient();
  let guests = demoGuests;
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data: client } = await supabase.from("clients").select("id").eq("profile_id", user.id).maybeSingle();
    const { data: project } = client ? await supabase.from("projects").select("id").eq("client_id", client.id).neq("status", "cancelled").order("created_at", { ascending: false }).limit(1).maybeSingle() : { data: null };
    const { data } = project ? await supabase.from("guests").select("id, name, phone, guest_group, pax, table_name, status").eq("project_id", project.id).order("name") : { data: [] };
    guests = (data || []) as Guest[];
  }

  const totalPax = guests.reduce((sum, guest) => sum + guest.pax, 0);
  const confirmedPax = guests.filter((guest) => ["confirmed", "attended"].includes(guest.status)).reduce((sum, guest) => sum + guest.pax, 0);
  const pendingPax = guests.filter((guest) => guest.status === "invited").reduce((sum, guest) => sum + guest.pax, 0);
  const declinedPax = guests.filter((guest) => guest.status === "declined").reduce((sum, guest) => sum + guest.pax, 0);
  const stats: Array<[string, number, string, LucideIcon, string, string]> = [
    ["Total tamu", totalPax, `${guests.length} undangan`, Users, "#edf4ff", "#2869e8"],
    ["Konfirmasi hadir", confirmedPax, "Sudah memberikan RSVP", CheckCircle2, "#eef9f5", "#44a982"],
    ["Menunggu", pendingPax, "Belum memberikan jawaban", Clock3, "#fff5e5", "#d39734"],
    ["Tidak hadir", declinedPax, "Menolak undangan", UserX, "#fff0f1", "#d96470"],
  ];

  return (
    <div className="px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
      <PortalPageHeader icon={Users} eyebrow="Guest management" title="Daftar Tamu" description="Kelola undangan, jumlah pax, konfirmasi kehadiran, kelompok tamu, dan penempatan meja." />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, note, Icon, background, color]) => <section key={label} className="rounded-2xl border border-[#e1e7ef] bg-white p-5"><div className="flex items-start justify-between"><div><p className="text-[9px] text-[#8e9bad]">{label}</p><p className="mt-2 text-[24px] font-semibold text-[#253650]">{value}</p></div><span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background, color }}><Icon size={16} /></span></div><p className="mt-2 text-[8px] text-[#a0aaba]">{note}</p></section>)}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_310px]">
        <section className="overflow-hidden rounded-2xl border border-[#e1e7ef] bg-white">
          <div className="flex flex-col gap-3 border-b border-[#e9edf3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-[12px] font-semibold text-[#2b3c56]">Undangan</h2><p className="mt-1 text-[8px] text-[#98a4b5]">Perubahan tersimpan langsung ke wedding project.</p></div><label className="flex h-9 w-full max-w-[230px] items-center gap-2 rounded-lg border border-[#dfe5ed] px-3 text-[#96a2b4]"><Search size={13} /><input placeholder="Cari nama tamu..." className="w-full text-[9px] outline-none" /></label></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left"><thead className="bg-[#fafbfd] text-[8px] uppercase tracking-[.1em] text-[#96a2b3]"><tr>{["Nama", "Kelompok", "Pax", "Meja", "RSVP", ""].map((heading) => <th key={heading || "action"} className="px-5 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#edf1f5]">
              {guests.map((guest) => <tr key={guest.id} className="text-[9px]"><td className="px-5 py-4"><p className="font-semibold text-[#40516a]">{guest.name}</p><p className="mt-1 text-[8px] text-[#9aa5b5]">{guest.phone || "Tanpa nomor"}</p></td><td className="px-5 py-4 text-[#748399]">{guest.guest_group || "Umum"}</td><td className="px-5 py-4 font-semibold text-[#40516a]">{guest.pax}</td><td className="px-5 py-4 text-[#748399]">{guest.table_name || "—"}</td><td className="px-5 py-4"><form action={async (formData) => { "use server"; await updateGuestStatus(formData); }} className="flex items-center gap-2"><input type="hidden" name="id" value={guest.id} /><select name="status" defaultValue={guest.status} className={`h-8 rounded-lg border px-2 text-[8px] font-semibold outline-none ${guest.status === "confirmed" || guest.status === "attended" ? "border-[#d6eee5] bg-[#eff9f5] text-[#418f72]" : guest.status === "declined" ? "border-[#f1dfe1] bg-[#fff5f5] text-[#c56972]" : "border-[#eee3cc] bg-[#fff9ee] text-[#b47d30]"}`}>{Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="submit" className="text-[8px] font-semibold text-[#2869e8]">Simpan</button></form></td><td className="px-5 py-4"><form action={async (formData) => { "use server"; await deleteGuest(formData); }}><input type="hidden" name="id" value={guest.id} /><button type="submit" aria-label={`Hapus ${guest.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[#d36b75] hover:bg-[#fff4f4]"><Trash2 size={13} /></button></form></td></tr>)}
            </tbody></table>
          </div>
          {!guests.length && <div className="px-6 py-14 text-center"><Users className="mx-auto text-[#a5b3c5]" size={30} /><p className="mt-3 text-[11px] font-semibold text-[#53647b]">Daftar tamu masih kosong</p><p className="mt-1 text-[9px] text-[#9aa6b6]">Tambahkan tamu pertama melalui formulir di samping.</p></div>}
        </section>

        <aside className="h-fit rounded-2xl border border-[#dce5f3] bg-white p-5 shadow-[0_8px_28px_rgba(40,75,120,.04)]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf4ff] text-[#2869e8]"><UserPlus size={17} /></span><h2 className="mt-4 text-[13px] font-semibold text-[#2d3e58]">Tambah tamu</h2><p className="mt-1 text-[8px] text-[#96a2b3]">Masukkan satu keluarga sebagai satu undangan.</p>
          <form action={async (formData) => { "use server"; await createGuest(formData); }} className="mt-5 space-y-3">
            <label className="block text-[8px] font-semibold text-[#687a92]">Nama tamu<input required name="name" minLength={2} maxLength={120} placeholder="Contoh: Budi & Keluarga" className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe5ed] px-3 text-[9px] outline-none focus:border-[#8eaae3]" /></label>
            <label className="block text-[8px] font-semibold text-[#687a92]">Nomor WhatsApp<input name="phone" placeholder="08xxxxxxxxxx" className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe5ed] px-3 text-[9px] outline-none focus:border-[#8eaae3]" /></label>
            <label className="block text-[8px] font-semibold text-[#687a92]">Kelompok<select name="guest_group" className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe5ed] bg-white px-3 text-[9px] outline-none"><option>Keluarga Pengantin Wanita</option><option>Keluarga Pengantin Pria</option><option>Sahabat</option><option>Rekan kerja</option><option>Lainnya</option></select></label>
            <label className="block text-[8px] font-semibold text-[#687a92]">Jumlah pax<input required name="pax" type="number" min={1} max={20} defaultValue={1} className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe5ed] px-3 text-[9px] outline-none" /></label>
            <button type="submit" className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2869e8] text-[9px] font-semibold text-white"><UserPlus size={13} />Tambahkan tamu</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
