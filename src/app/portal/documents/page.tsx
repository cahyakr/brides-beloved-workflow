import { PortalPageHeader } from "@/components/portal-page-header";
import { deleteClientDocument, uploadClientDocument } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";
import { Download, File, FileCheck2, FileText, FolderOpen, Trash2, UploadCloud } from "lucide-react";
import { redirect } from "next/navigation";

type DocumentRow = { id: string; name: string; path: string; type: string | null; size: number | null; category: string; created_at: string; uploaded_by: string | null; url?: string | null };

const categoryLabels: Record<string, string> = { kua: "Berkas KUA", contract: "Kontrak", payment: "Pembayaran", brief: "Brief acara", general: "Lainnya" };

function fileSize(value: number | null) {
  if (!value) return "—";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export default async function DocumentsPage() {
  const supabase = await createClient();
  let documents: DocumentRow[] = [
    { id: "d1", name: "Wedding-Brief-Sarah-Daniel.pdf", path: "", type: "application/pdf", size: 2140000, category: "brief", created_at: "2026-08-08T10:00:00Z", uploaded_by: null },
    { id: "d2", name: "Kontrak-Venue.pdf", path: "", type: "application/pdf", size: 980000, category: "contract", created_at: "2026-08-02T10:00:00Z", uploaded_by: null },
    { id: "d3", name: "Checklist-Berkas-KUA.pdf", path: "", type: "application/pdf", size: 420000, category: "kua", created_at: "2026-07-29T10:00:00Z", uploaded_by: null },
  ];
  let currentUserId: string | null = null;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    currentUserId = user.id;
    const { data: client } = await supabase.from("clients").select("id").eq("profile_id", user.id).maybeSingle();
    const { data: project } = client ? await supabase.from("projects").select("id").eq("client_id", client.id).neq("status", "cancelled").order("created_at", { ascending: false }).limit(1).maybeSingle() : { data: null };
    const { data: dbDocuments } = project ? await supabase.from("files").select("id, name, path, type, size, category, created_at, uploaded_by").eq("project_id", project.id).eq("visible_to_client", true).order("created_at", { ascending: false }) : { data: [] };
    documents = await Promise.all(((dbDocuments || []) as DocumentRow[]).map(async (document) => {
      const { data } = await supabase.storage.from("project-files").createSignedUrl(document.path, 3600);
      return { ...document, url: data?.signedUrl || null };
    }));
  }

  const categories = new Set(documents.map((document) => document.category));

  return (
    <div className="px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
      <PortalPageHeader icon={FolderOpen} eyebrow="Project files" title="Dokumen Pernikahan" description="Simpan brief, kontrak, bukti pembayaran, dan berkas KUA dengan aman di project pernikahanmu." />

      <div className="mt-7 grid gap-5 xl:grid-cols-[1fr_310px]">
        <section className="overflow-hidden rounded-2xl border border-[#e1e7ef] bg-white">
          <div className="flex items-center justify-between border-b border-[#e9edf3] px-5 py-4"><div><h2 className="text-[12px] font-semibold text-[#2b3c56]">Semua dokumen</h2><p className="mt-1 text-[8px] text-[#98a4b5]">{documents.length} file dalam {categories.size} kategori</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#edf4ff] text-[#2869e8]"><FileCheck2 size={16} /></span></div>
          <div className="divide-y divide-[#edf1f5]">
            {documents.map((document) => (
              <div key={document.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f1f5fb] text-[#6480ad]"><FileText size={17} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-[#3d4f68]">{document.name}</p><p className="mt-1 text-[8px] text-[#98a4b5]">{categoryLabels[document.category] || document.category} · {fileSize(document.size)} · {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(document.created_at))}</p></div>
                <div className="flex items-center gap-2">
                  {document.url ? <a href={document.url} target="_blank" rel="noreferrer" className="flex h-8 items-center gap-1.5 rounded-lg border border-[#dfe5ed] px-3 text-[8px] font-semibold text-[#5d708b]"><Download size={12} />Unduh</a> : <span className="rounded-lg bg-[#f3f5f8] px-3 py-2 text-[8px] text-[#a0aaba]">Demo file</span>}
                  {currentUserId && document.uploaded_by === currentUserId && <form action={async (formData) => { "use server"; await deleteClientDocument(formData); }}><input type="hidden" name="id" value={document.id} /><button type="submit" aria-label={`Hapus ${document.name}`} className="grid h-8 w-8 place-items-center rounded-lg border border-[#f1dfe1] text-[#d36b75] hover:bg-[#fff4f4]"><Trash2 size={12} /></button></form>}
                </div>
              </div>
            ))}
            {!documents.length && <div className="px-6 py-16 text-center"><File className="mx-auto text-[#a5b3c5]" size={30} /><p className="mt-3 text-[11px] font-semibold text-[#53647b]">Belum ada dokumen</p><p className="mt-1 text-[9px] text-[#9aa6b6]">Unggah dokumen pertama melalui panel di samping.</p></div>}
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-[#dce5f3] bg-gradient-to-b from-white to-[#f8faff] p-5 shadow-[0_8px_28px_rgba(40,75,120,.05)]">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eaf2ff] text-[#2869e8]"><UploadCloud size={19} /></span>
          <h2 className="mt-4 text-[13px] font-semibold text-[#2d3e58]">Unggah dokumen</h2>
          <p className="mt-1.5 text-[8px] leading-relaxed text-[#8d9aab]">PDF, JPG, PNG, atau dokumen Office. Maksimal 10 MB per file.</p>
          <form action={async (formData) => { "use server"; await uploadClientDocument(formData); }} className="mt-5 space-y-3">
            <label className="block text-[8px] font-semibold text-[#687a92]">Kategori<select name="category" className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe5ed] bg-white px-3 text-[9px] outline-none focus:border-[#8eaae3]">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="flex min-h-[110px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd7e8] bg-white px-4 text-center transition hover:border-[#87a7df] hover:bg-[#fbfdff]"><UploadCloud size={19} className="text-[#7797ce]" /><span className="mt-2 text-[9px] font-semibold text-[#61748e]">Pilih file</span><span className="mt-1 text-[8px] text-[#a0abba]">Klik untuk membuka file</span><input required type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" className="sr-only" /></label>
            <button type="submit" className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#2869e8] text-[9px] font-semibold text-white shadow-[0_8px_20px_rgba(40,105,232,.18)]"><UploadCloud size={13} />Unggah sekarang</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
