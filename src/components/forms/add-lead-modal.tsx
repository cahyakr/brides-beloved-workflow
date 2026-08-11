"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createLead } from "@/lib/actions";

export function AddLeadModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await createLead(formData);
    setLoading(false);
    if (res?.success) setOpen(false);
    else alert(res?.error || "Gagal menyimpan data.");
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2f80ed] px-4 text-xs font-semibold text-white">
        <Plus size={15}/>New Lead
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1e3b]/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#edf1f5] pb-4">
              <h2 className="text-lg font-semibold text-[#112b52]">Tambah Prospek Baru</h2>
              <button onClick={() => setOpen(false)} className="text-[#8d9ab0] hover:text-[#112b52]"><X size={18}/></button>
            </div>
            
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-xs font-semibold text-[#6f819a]">
                  Nama Bride
                  <input required name="bride_name" className="mt-1.5 h-10 w-full rounded-md border border-[#dce4ee] px-3 font-normal outline-none focus:border-[#2f80ed]" />
                </label>
                <label className="block text-xs font-semibold text-[#6f819a]">
                  Nama Groom
                  <input required name="groom_name" className="mt-1.5 h-10 w-full rounded-md border border-[#dce4ee] px-3 font-normal outline-none focus:border-[#2f80ed]" />
                </label>
              </div>
              <label className="block text-xs font-semibold text-[#6f819a]">
                Email
                <input required type="email" name="email" className="mt-1.5 h-10 w-full rounded-md border border-[#dce4ee] px-3 font-normal outline-none focus:border-[#2f80ed]" />
              </label>
              <label className="block text-xs font-semibold text-[#6f819a]">
                Nomor Telepon / WA
                <input required name="phone" className="mt-1.5 h-10 w-full rounded-md border border-[#dce4ee] px-3 font-normal outline-none focus:border-[#2f80ed]" />
              </label>
              <label className="block text-xs font-semibold text-[#6f819a]">
                Rencana Tanggal Wedding
                <input type="date" name="wedding_date" className="mt-1.5 h-10 w-full rounded-md border border-[#dce4ee] px-3 font-normal outline-none focus:border-[#2f80ed]" />
              </label>
              
              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-xs font-semibold text-[#536b89] hover:bg-[#f4f7fa]">Batal</button>
                <button type="submit" disabled={loading} className="rounded-lg bg-[#2f80ed] px-5 py-2 text-xs font-semibold text-white hover:bg-[#256bc8] disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
