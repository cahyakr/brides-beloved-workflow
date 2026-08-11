"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type ClientTaskProps = {
  id: string;
  title: string;
  description: string;
  status: string;
};

export function ClientTaskItem({ id, title, description, status }: ClientTaskProps) {
  const [loading, setLoading] = useState(false);
  const isDone = status === "completed";

  async function toggleStatus() {
    setLoading(true);
    const { completeClientTask } = await import("@/lib/actions");
    
    const formData = new FormData();
    formData.append("id", id);
    formData.append("status", isDone ? "not_started" : "completed");
    
    await completeClientTask(formData);
    setLoading(false);
  }

  return (
    <div className={`group relative mb-3 flex items-start gap-4 overflow-hidden rounded-2xl bg-white p-5 transition-all duration-300 hover:shadow-xl hover:shadow-[#9796f0]/10 ${isDone ? "border border-[#e1f5f0]" : "border border-[#f1e6ff] shadow-sm"}`}>
      {/* Interactive Checkbox */}
      <button 
        onClick={toggleStatus}
        disabled={loading}
        className={`relative mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-4 ${isDone ? "border-[#5ce1b2] bg-[#5ce1b2] text-white focus:ring-[#5ce1b2]/30" : "border-[#e0dce6] bg-transparent hover:border-[#bba6ed] hover:bg-[#f6f2fe] focus:ring-[#bba6ed]/30"} ${loading ? "opacity-50 cursor-wait" : ""}`}
      >
        <span className={`transition-transform duration-300 ${isDone ? "scale-100" : "scale-0"}`}>
          <Check strokeWidth={3} size={14} />
        </span>
      </button>
      
      {/* Content */}
      <div className="flex-1">
        <h4 className={`text-[15px] font-semibold transition-colors duration-300 ${isDone ? "text-[#a39fbd] line-through" : "text-[#39345e] group-hover:text-[#5c5493]"}`}>
          {title}
        </h4>
        <p className={`mt-1.5 text-sm transition-colors duration-300 ${isDone ? "text-[#c2bed4]" : "text-[#7a7698]"}`}>
          {description || "Tidak ada deskripsi yang ditambahkan untuk tugas ini."}
        </p>
      </div>
      
      {/* Decorative side accent for done state */}
      <div className={`absolute right-0 top-0 h-full w-1.5 transition-all duration-300 ${isDone ? "bg-gradient-to-b from-[#5ce1b2] to-[#3db38b] opacity-100" : "bg-transparent opacity-0"}`} />
    </div>
  );
}
