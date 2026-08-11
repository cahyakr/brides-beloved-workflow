import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";

export default function PortalDashboard() {
  return (
    <div className="p-8 lg:p-12 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#2d2a45]">Dashboard Utama 🕊️</h1>
        <p className="mt-2 text-[#7a7698]">Selamat datang di pusat perencanaan pernikahan impianmu.</p>
      </div>
      
      <div className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#9796f0] to-[#fbc7d4] p-10 text-white shadow-2xl shadow-[#9796f0]/30">
        <div className="absolute -right-10 -top-10 opacity-20">
          <Heart size={200} fill="currentColor" />
        </div>
        
        <div className="relative z-10">
          <h2 className="mb-3 text-3xl font-black drop-shadow-md">Mari Mulai Perjalanan Indah Ini!</h2>
          <p className="max-w-xl text-lg font-medium text-white/90 drop-shadow-sm mb-8">
            Semua detail, mulai dari penyusunan daftar tamu hingga konfirmasi vendor, telah kami siapkan dengan rapi agar kamu bisa menikmati prosesnya tanpa stres.
          </p>
          <Link href="/portal/timeline" className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-[#9796f0] shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
            Lihat Timeline Persiapan 
            <span className="rounded-full bg-[#f8f5ff] p-1 transition-transform group-hover:translate-x-1">
              <ArrowRight strokeWidth={3} size={16} />
            </span>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-[2rem] border border-[#f1e6ff] bg-white p-8 shadow-xl shadow-[#9796f0]/5 transition-transform hover:-translate-y-1">
          <h3 className="mb-2 text-xl font-extrabold text-[#39345e]">Progress Singkat</h3>
          <p className="text-sm font-medium text-[#7a7698] leading-relaxed">
            Cek halaman timeline secara berkala untuk memantau progres lengkap dari setiap tugas dan milestones persiapanmu.
          </p>
        </div>
        <div className="rounded-[2rem] border border-[#f1e6ff] bg-white p-8 shadow-xl shadow-[#9796f0]/5 transition-transform hover:-translate-y-1">
          <h3 className="mb-2 text-xl font-extrabold text-[#39345e]">Meeting Selanjutnya</h3>
          <p className="text-sm font-medium text-[#7a7698] leading-relaxed">
            Saat ini belum ada jadwal meeting dalam waktu dekat. Kami akan menghubungimu saat Technical Meeting sudah siap.
          </p>
        </div>
      </div>
    </div>
  );
}
