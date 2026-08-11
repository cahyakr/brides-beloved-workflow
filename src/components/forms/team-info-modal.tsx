"use client";

import { useState } from "react";
import { Plus, X, Users, AlertCircle } from "lucide-react";

export function TeamInfoModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2f80ed] px-4 text-xs font-semibold text-white">
        <Plus size={15}/>Add Team Member
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1e3b]/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#edf1f5] pb-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-[#112b52]">
                <Users size={18} className="text-[#2f80ed]" />
                Tambah Anggota Tim
              </h2>
              <button onClick={() => setOpen(false)} className="text-[#8d9ab0] hover:text-[#112b52]"><X size={18}/></button>
            </div>
            
            <div className="mt-5 space-y-4">
              <div className="flex gap-3 rounded-lg bg-[#fff8e6] p-4 text-[#c2872f]">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Demi keamanan data perusahaan, pembuatan akun untuk tim internal <b>harus dilakukan melalui menu Authentication</b> di Supabase Dashboard Anda.
                </p>
              </div>
              
              <div className="text-xs text-[#536b89] space-y-2">
                <p>Langkah-langkah:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Buka proyek Supabase Anda.</li>
                  <li>Masuk ke menu <b>Authentication &gt; Users</b>.</li>
                  <li>Klik <b>Add User</b> lalu pilih <b>Create New User</b>.</li>
                  <li>Masukkan email dan password untuk anggota tim baru.</li>
                  <li>Anggota tim tersebut sekarang bisa login ke aplikasi ini.</li>
                </ol>
              </div>
              
              <div className="mt-6 flex justify-end pt-2">
                <button onClick={() => setOpen(false)} className="rounded-lg bg-[#2f80ed] px-5 py-2 text-xs font-semibold text-white hover:bg-[#256bc8]">
                  Mengerti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
