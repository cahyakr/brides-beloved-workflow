"use client";

import { createClientTask } from "@/lib/actions";
import { Loader2, X } from "lucide-react";
import { useState, useTransition } from "react";

type Props = {
  projectId: string;
  onClose: () => void;
};

export function RequestTaskModal({ projectId, onClose }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function action(formData: FormData) {
    formData.set("project_id", projectId);
    
    startTransition(async () => {
      setError(null);
      const result = await createClientTask(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#112b52]/40 backdrop-blur-sm p-4">
      <div className="animate-in relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#7586a5] hover:text-[#112b52] transition"
        >
          <X size={20} />
        </button>

        <h2 className="text-[18px] font-semibold text-[#112b52] font-[family-name:var(--font-display)]">Ajukan Tugas Baru</h2>
        <p className="mt-1 text-[13px] text-[#7586a5]">
          Punya permintaan atau ide khusus untuk pernikahanmu? Beri tahu tim perencana kami.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-[13px] text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form action={action} className="mt-5 space-y-4">
          <div>
            <label htmlFor="title" className="block text-[12px] font-semibold text-[#112b52] mb-1.5">
              Judul Tugas
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="Contoh: Booking penari tradisional"
              className="w-full rounded-lg border border-[#e7edf5] px-3.5 py-2 text-[14px] outline-none transition focus:border-[#2f80ed] focus:ring-1 focus:ring-[#2f80ed]"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-[12px] font-semibold text-[#112b52] mb-1.5">
              Detail Tambahan
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Jelaskan lebih detail permintaan kamu..."
              className="w-full rounded-lg border border-[#e7edf5] px-3.5 py-2 text-[14px] outline-none transition focus:border-[#2f80ed] focus:ring-1 focus:ring-[#2f80ed]"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2f80ed] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#256bc7] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {pending && <Loader2 size={16} className="animate-spin" />}
              {pending ? "Mengirim..." : "Ajukan Tugas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
