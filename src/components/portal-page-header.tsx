import type { LucideIcon } from "lucide-react";

export function PortalPageHeader({ icon: Icon, eyebrow, title, description, children }: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.16em] text-[#97a3b6]"><Icon size={13} className="text-[#2869e8]" />{eyebrow}</p>
        <h1 className="mt-2 text-[27px] font-semibold tracking-[-.04em] text-[#17233d] sm:text-[31px]">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-[10px] leading-relaxed text-[#8190a6]">{description}</p>
      </div>
      {children}
    </div>
  );
}
