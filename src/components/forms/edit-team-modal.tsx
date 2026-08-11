"use client";

import { useState } from "react";
import { Edit2, X } from "lucide-react";
import { updateTeamMember, deactivateTeamMember } from "@/lib/actions";

export function EditTeamModal({ profile }: { profile: { id: string, full_name: string, role: string, is_active: boolean } }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("id", profile.id);
    const res = await updateTeamMember(formData);
    setLoading(false);
    if (res?.success) setOpen(false);
    else alert(res?.error || "Gagal menyimpan data.");
  }

  async function onDeactivate() {
    if (!confirm("Yakin ingin menonaktifkan / menghapus akses anggota ini?")) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("id", profile.id);
    const res = await deactivateTeamMember(formData);
    setLoading(false);
    if (res?.success) setOpen(false);
    else alert(res?.error || "Gagal menonaktifkan anggota.");
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-[#8d9ab0] hover:text-[#2f80ed]">
        <Edit2 size={15} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1e3b]/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#edf1f5] pb-4">
              <h2 className="text-lg font-semibold text-[#112b52]">Edit Anggota Tim</h2>
              <button onClick={() => setOpen(false)} className="text-[#8d9ab0] hover:text-[#112b52]"><X size={18}/></button>
            </div>
            
            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <label className="block text-xs font-semibold text-[#6f819a]">
                Nama Lengkap
                <input required name="full_name" defaultValue={profile.full_name} className="mt-1.5 h-10 w-full rounded-md border border-[#dce4ee] px-3 font-normal outline-none focus:border-[#2f80ed]" />
              </label>
              
              <label className="block text-xs font-semibold text-[#6f819a]">
                Role
                <select required name="role" defaultValue={profile.role} className="mt-1.5 h-10 w-full rounded-md border border-[#dce4ee] px-3 font-normal outline-none focus:border-[#2f80ed]">
                  <option value="super_admin">Super Admin</option>
                  <option value="team">Team (Staff)</option>
                  <option value="vendor">Vendor</option>
                  <option value="client">Client</option>
                </select>
              </label>
              
              <label className="flex items-center gap-2 text-xs font-semibold text-[#6f819a]">
                <input type="checkbox" name="is_active" defaultChecked={profile.is_active} className="rounded border-[#dce4ee] text-[#2f80ed]" />
                Akun Aktif (Dapat Login)
              </label>
              
              <div className="mt-6 flex items-center justify-between pt-2">
                <button type="button" onClick={onDeactivate} disabled={loading || !profile.is_active} className="text-xs font-semibold text-[#e46a80] hover:underline disabled:opacity-50">
                  Deactivate User
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-xs font-semibold text-[#536b89] hover:bg-[#f4f7fa]">Batal</button>
                  <button type="submit" disabled={loading} className="rounded-lg bg-[#2f80ed] px-5 py-2 text-xs font-semibold text-white hover:bg-[#256bc8] disabled:opacity-50">
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
