"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  CalendarRange,
  ChevronDown,
  CircleHelp,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Store,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { Brand } from "./brand";

const mainNavigation = [
  { href: "/portal", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/portal/timeline", label: "Wedding Planner", icon: CalendarRange },
] as const;

const upcomingModules = [
  { label: "Budget", icon: WalletCards },
  { label: "Dokumen", icon: FileText },
  { label: "Tamu", icon: Users },
  { label: "Vendor", icon: Store },
] as const;

export function PortalShell({ children, clientName }: { children: React.ReactNode; clientName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initials = clientName
    .split(" & ")
    .map((name) => name.trim()[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#17233d]">
      {open && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-[#17233d]/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[242px] flex-col border-r border-[#e8edf5] bg-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[78px] items-center border-b border-[#edf1f6] px-6">
          <Brand />
        </div>

        <div className="px-4 py-6">
          <p className="px-3 pb-3 text-[9px] font-bold uppercase tracking-[.18em] text-[#a0abbd]">Perencanaan</p>
          <nav className="space-y-1.5">
            {mainNavigation.map(({ href, label, icon: Icon }) => {
              const active = href === "/portal" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex h-11 items-center gap-3 rounded-xl px-3.5 text-[12px] font-semibold transition ${active ? "bg-[#edf4ff] text-[#2769d5]" : "text-[#607089] hover:bg-[#f7f9fc] hover:text-[#263b5b]"}`}
                >
                  <Icon size={17} strokeWidth={1.9} />
                  {label}
                  {label === "Wedding Planner" && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#5bd5aa]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-4">
          <p className="px-3 pb-3 text-[9px] font-bold uppercase tracking-[.18em] text-[#a0abbd]">Segera hadir</p>
          <div className="space-y-1">
            {upcomingModules.map(({ label, icon: Icon }) => (
              <div key={label} className="flex h-10 items-center gap-3 px-3.5 text-[11px] font-medium text-[#9aa6b7]">
                <Icon size={15} strokeWidth={1.8} />
                {label}
                <span className="ml-auto rounded-full bg-[#f1f3f7] px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#a0aabd]">soon</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto border-t border-[#edf1f6] p-4">
          <Link href="#" className="flex h-9 items-center gap-3 px-3 text-[11px] font-medium text-[#78879c]"><CircleHelp size={15} />Bantuan</Link>
          <Link href="#" className="flex h-9 items-center gap-3 px-3 text-[11px] font-medium text-[#78879c]"><Settings size={15} />Pengaturan</Link>
          <Link href="/login" className="mt-2 flex h-10 items-center gap-3 rounded-lg bg-[#fff4f4] px-3 text-[11px] font-semibold text-[#d76570]"><LogOut size={15} />Keluar</Link>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-[242px]">
        <header className="sticky top-0 z-30 flex h-[70px] items-center gap-4 border-b border-[#e8edf5] bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button type="button" onClick={() => setOpen(true)} aria-label="Buka menu" className="grid h-9 w-9 place-items-center rounded-lg border border-[#e0e6ef] text-[#56677f] lg:hidden">
            <Menu size={18} />
          </button>
          <label className="hidden h-9 w-full max-w-[390px] items-center gap-2.5 rounded-lg bg-[#f7f9fc] px-3.5 text-[#9aa8bb] sm:flex">
            <Search size={15} />
            <input aria-label="Cari tugas" placeholder="Cari tugas atau milestone..." className="w-full bg-transparent text-[11px] text-[#43536b] outline-none placeholder:text-[#a1adbd]" />
            <kbd className="rounded border border-[#e0e6ee] bg-white px-1.5 py-0.5 text-[8px]">⌘ K</kbd>
          </label>
          <div className="ml-auto flex items-center gap-3">
            <button type="button" aria-label="Notifikasi" className="relative grid h-9 w-9 place-items-center rounded-full border border-[#e3e8f0] text-[#6b7c94]">
              <Bell size={16} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#f06f78] ring-2 ring-white" />
            </button>
            <div className="hidden h-9 items-center gap-2.5 border-l border-[#e7ebf1] pl-3 sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#dceaff] to-[#f3e8ff] text-[10px] font-bold text-[#526989]">{initials || "BB"}</span>
              <div className="max-w-[130px] leading-tight">
                <p className="truncate text-[10px] font-semibold text-[#35465f]">{clientName}</p>
                <p className="mt-0.5 text-[8px] text-[#96a2b4]">Client workspace</p>
              </div>
              <ChevronDown size={13} className="text-[#9ba8ba]" />
            </div>
          </div>
        </header>
        {children}
      </main>

      {open && (
        <button type="button" onClick={() => setOpen(false)} aria-label="Tutup sidebar" className="fixed right-4 top-4 z-[60] grid h-9 w-9 place-items-center rounded-full bg-white text-[#40516a] shadow-lg lg:hidden">
          <X size={18} />
        </button>
      )}
    </div>
  );
}
