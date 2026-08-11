import { Flower2 } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`grid h-9 w-9 place-items-center rounded-full ${light ? "bg-white/15 text-white" : "bg-[#edf5ff] text-[#2f80ed]"}`}>
        <Flower2 size={18} strokeWidth={1.8} />
      </span>
      <div className="leading-none">
        <div className={`display-font text-[21px] font-semibold ${light ? "text-white" : "text-[#112b52]"}`}>Brides Beloved</div>
        <div className={`mt-1 text-[8px] font-bold uppercase tracking-[.25em] ${light ? "text-white/60" : "text-[#8a9ab5]"}`}>Wedding Organizer</div>
      </div>
    </div>
  );
}
