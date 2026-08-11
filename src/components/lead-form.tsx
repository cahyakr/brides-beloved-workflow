"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function LeadForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mengirim form.");
      setSent(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Gagal mengirim form."); }
    finally { setBusy(false); }
  }
  if (sent) return <div className="grid min-h-[460px] place-items-center border border-[#e1ddd4] bg-[#fbf9f5] p-10 text-center"><div><CheckCircle2 size={38} className="mx-auto text-[#7e9c7a]"/><h3 className="display-font mt-5 text-3xl">Thank you.</h3><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#77838e]">Form kamu sudah siap. Pada mode Supabase, lead ini akan masuk ke dashboard tim secara otomatis.</p><button onClick={()=>setSent(false)} className="mt-6 text-xs font-bold text-[#a17d53]">Kirim data lain</button></div></div>;
  return <form onSubmit={submit} className="border border-[#e1ddd4] bg-[#fbf9f5] p-6 sm:p-9"><div className="grid gap-5 sm:grid-cols-2"><Field name="bride_name" label="Calon pengantin wanita" placeholder="Sarah" required/><Field name="groom_name" label="Calon pengantin pria" placeholder="Daniel" required/><Field name="email" label="Email" placeholder="sarah@email.com" type="email" required/><Field name="phone" label="WhatsApp" placeholder="+62 812 3456 7890" required/><Field name="wedding_date" label="Tanggal wedding" type="date" required/><Field name="venue" label="Venue / lokasi" placeholder="Jakarta / Bali"/><Field name="guest_count" label="Jumlah tamu" placeholder="500" type="number"/><label className="text-[11px] font-semibold text-[#536675]">Paket yang diminati<select name="package_interest" className="mt-2 h-11 w-full border-b border-[#cfd5d7] bg-transparent text-sm outline-none"><option>Full Wedding Planning</option><option>Wedding Organizer</option><option>Intimate Wedding</option></select></label></div><label className="mt-5 block text-[11px] font-semibold text-[#536675]">Pesan tambahan<textarea name="message" placeholder="Ceritakan sedikit tentang rencana wedding kamu..." className="mt-2 h-24 w-full resize-none border-b border-[#cfd5d7] bg-transparent py-2 text-sm outline-none"/></label>{error&&<p className="mt-4 text-xs text-[#c55b67]">{error}</p>}<button disabled={busy} className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 bg-[#173044] text-xs font-bold text-white transition hover:bg-[#24455c] disabled:opacity-60">{busy?"Mengirim...":"Kirim & Jadwalkan Konsultasi"} {!busy&&<ArrowRight size={15}/>}</button></form>;
}

function Field({label, ...props}: React.InputHTMLAttributes<HTMLInputElement> & {label:string}) { return <label className="text-[11px] font-semibold text-[#536675]">{label}<input {...props} className="mt-2 h-11 w-full border-b border-[#cfd5d7] bg-transparent text-sm outline-none placeholder:text-[#b0b7bb] focus:border-[#a98150]"/></label> }
