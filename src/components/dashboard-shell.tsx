"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell, CalendarDays, ChevronDown, CircleHelp, FolderKanban, LayoutDashboard,
  LogOut, Menu, Settings, Sparkles, Users, UserRoundSearch, X, FileText,
} from "lucide-react";
import { Brand } from "./brand";

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Timeline", "/dashboard/timeline", CalendarDays],
  ["Clients", "/dashboard/clients", UserRoundSearch],
  ["Weddings", "/dashboard/projects", FolderKanban],
  ["Team", "/dashboard/team", Users],
  ["Leads", "/dashboard/leads", Sparkles],
  ["Files", "/dashboard/files", FileText],
] as const;

export function DashboardShell({ children, userProfile }: { children: React.ReactNode, userProfile?: { name: string, role: string, initials: string } }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const profile = userProfile || { name: "Maya Putri", role: "Super Admin", initials: "MP" };
  return (
    <div className="min-h-screen bg-white text-[#112b52]">
      {open && <button aria-label="Tutup menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-[#0b1e3b]/25 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[244px] flex-col border-r border-[#e7edf5] bg-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[82px] items-center border-b border-[#eef2f7] px-7"><Brand /></div>
        <div className="px-4 py-5">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#9aa8be]">Workspace</p>
          <nav className="space-y-1">
            {nav.map(([label, href, Icon]) => {
              const active = href === "/dashboard" ? path === href : path.startsWith(href);
              return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex h-11 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition ${active ? "bg-[#edf5ff] text-[#1f69cf]" : "text-[#536883] hover:bg-[#f7f9fc]"}`}><Icon size={17} strokeWidth={1.8} />{label}{label === "Weddings" && <ChevronDown size={14} className="ml-auto" />}</Link>;
            })}
          </nav>
        </div>
        <div className="mx-4 border-t border-[#e7edf5] pt-4">
          <Link href="#" className="flex h-10 items-center gap-3 px-3 text-[13px] text-[#667a97]"><CircleHelp size={17} />Support</Link>
          <Link href="/dashboard/settings" className="flex h-10 items-center gap-3 px-3 text-[13px] text-[#667a97]"><Settings size={17} />Settings</Link>
        </div>
        <div className="mt-auto border-t border-[#e7edf5] p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-[#f8fafd] p-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#dcecff] text-[11px] font-bold text-[#276fc9]">{profile.initials}</span>
            <div className="min-w-0"><p className="truncate text-xs font-semibold">{profile.name}</p><p className="text-[10px] text-[#8998af] capitalize">{profile.role}</p></div>
          </div>
          <Link href="/login" className="flex items-center gap-2 px-3 text-xs text-[#71829c]"><LogOut size={15} />Logout</Link>
        </div>
      </aside>
      <main className="min-h-screen lg:pl-[244px]">
        <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-[#edf1f6] bg-white/95 px-5 backdrop-blur lg:px-8">
          <button aria-label="Buka menu" onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-[#e4eaf2] lg:hidden"><Menu size={18} /></button>
          <div className="hidden text-[11px] text-[#92a0b6] lg:block">Workspace <span className="mx-2">›</span> Brides Beloved</div>
          <div className="ml-auto flex items-center gap-3">
            <button aria-label="Notifikasi" className="relative grid h-9 w-9 place-items-center rounded-full border border-[#e7edf5] text-[#7185a1]"><Bell size={16} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#2f80ed] ring-2 ring-white" /></button>
            <div className="hidden items-center gap-2 sm:flex"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e7f1ff] text-[10px] font-bold text-[#2f70c6]">{profile.initials}</span><ChevronDown size={13} className="text-[#8796ad]" /></div>
          </div>
        </header>
        {children}
      </main>
      {open && <button onClick={() => setOpen(false)} className="fixed right-4 top-4 z-[60] grid h-9 w-9 place-items-center rounded-full bg-white lg:hidden" aria-label="Tutup sidebar"><X size={18} /></button>}
    </div>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div>{eyebrow && <p className="mb-2 text-[11px] font-medium text-[#8c9ab0]">{eyebrow}</p>}<h1 className="text-[25px] font-semibold tracking-[-.03em] text-[#112b52] sm:text-[29px]">{title}</h1></div>{children}</div>;
}
