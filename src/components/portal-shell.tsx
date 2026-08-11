"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, Wallet, FileText, Banknote, Users, Store, Settings, LogOut, CheckSquare } from "lucide-react";
import { Brand } from "./brand";

const navItems = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/timeline", label: "Timeline", icon: CheckSquare },
  { href: "/portal/budget", label: "Budget", icon: Wallet },
  { href: "/portal/berkas", label: "Berkas KUA", icon: FileText },
  { href: "/portal/keuangan", label: "Keuangan", icon: Banknote },
  { href: "/portal/tamu", label: "Tamu", icon: Users },
  { href: "/portal/vendor", label: "Vendor", icon: Store },
  { href: "/portal/pengaturan", label: "Pengaturan", icon: Settings },
];

export function PortalShell({ children, clientName }: { children: React.ReactNode, clientName: string }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#fcf9ff] text-[#2d2a45]">
      {/* Playful & Premium Sidebar */}
      <aside className="w-[280px] shrink-0 border-r border-[#f1e6ff] bg-white/60 p-6 pb-10 flex flex-col backdrop-blur-3xl relative z-10">
        <div className="mb-10 flex flex-col items-center justify-center text-center">
          {/* Logo / Brand block */}
          <div className="w-full rounded-3xl bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] p-6 shadow-xl shadow-[#ff9a9e]/20 text-white">
            <h1 className="text-2xl font-black leading-tight tracking-tight drop-shadow-md">Love<br/>Journey</h1>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/90 drop-shadow-sm">{clientName}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-300 ${isActive ? "bg-gradient-to-r from-[#9796f0] to-[#fbc7d4] text-white shadow-lg shadow-[#9796f0]/30 scale-105" : "text-[#7a7698] hover:bg-[#f8f5ff] hover:text-[#5a567c]"}`}
              >
                <item.icon size={18} strokeWidth={2.5} className={isActive ? "text-white" : "text-[#a39fbd]"} /> {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/login" className="mt-auto flex items-center gap-3 rounded-2xl bg-[#fff0f3] px-5 py-3.5 text-sm font-bold text-[#fc7692] transition-all hover:bg-[#ffe3e8] hover:scale-105">
          <LogOut size={18} strokeWidth={2.5} /> Logout
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-x-hidden">
        {/* Soft background blob */}
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#fbc7d4]/30 to-[#9796f0]/30 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#ff9a9e]/20 to-[#fecfef]/20 blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
