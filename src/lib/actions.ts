"use server";

import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";

type ServerSupabase = NonNullable<Awaited<ReturnType<typeof createClient>>>;

async function getClientProjectId(supabase: ServerSupabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" } as const;

  const { data: client } = await supabase.from("clients").select("id").eq("profile_id", user.id).maybeSingle();
  if (!client) return { error: "Client profile not found" } as const;

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("client_id", client.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!project) return { error: "Wedding project not found" } as const;
  return { user, projectId: project.id } as const;
}

export async function createLead(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "No DB connection" };

  const bride_name = formData.get("bride_name") as string;
  const groom_name = formData.get("groom_name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const wedding_date = formData.get("wedding_date") as string;

  const { error } = await supabase.from("leads").insert({
    bride_name,
    groom_name,
    email,
    phone,
    wedding_date: wedding_date || null,
    status: "new"
  });

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function createClientRecord(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "No DB connection" };

  const bride_name = formData.get("bride_name") as string;
  const groom_name = formData.get("groom_name") as string;
  const email = formData.get("email") as string;

  const { error } = await supabase.from("clients").insert({
    bride_name,
    groom_name,
    display_name: `${bride_name} & ${groom_name}`,
    email,
    status: "active"
  });

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/clients");
  return { success: true };
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "No DB connection" };

  const name = formData.get("name") as string;
  const event_date = formData.get("event_date") as string;
  const client_id = formData.get("client_id") as string;

  const { error } = await supabase.from("projects").insert({
    name,
    event_date: event_date || null,
    client_id,
    status: "planning"
  });

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTeamMember(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "No DB connection" };

  const id = formData.get("id") as string;
  const full_name = formData.get("full_name") as string;
  const role = formData.get("role") as string;
  const is_active = formData.get("is_active") === "on";

  const { error } = await supabase.from("profiles").update({
    full_name,
    role,
    is_active
  }).eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/team");
  return { success: true };
}

export async function deactivateTeamMember(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "No DB connection" };

  const id = formData.get("id") as string;

  const { error } = await supabase.from("profiles").update({
    is_active: false
  }).eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/team");
  return { success: true };
}
export async function updateTask(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "No DB connection" };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const uiStatus = formData.get("status") as string;
  const uiPriority = formData.get("priority") as string;

  const statusMap: Record<string, string> = {
    "Not Started": "not_started",
    "In Progress": "in_progress",
    "In Review": "in_review",
    "Revision": "revision",
    "Complete": "completed"
  };

  const priorityMap: Record<string, string> = {
    "Low": "low",
    "Medium": "medium",
    "High": "high"
  };

  const status = statusMap[uiStatus] || "not_started";
  const priority = priorityMap[uiPriority] || "low";

  const { error } = await supabase.from("tasks").update({
    status,
    priority
  }).eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/dashboard/timeline");
  return { success: true };
}

export async function completeClientTask(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { success: true, demo: true };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!id || !["not_started", "completed"].includes(status)) {
    return { error: "Invalid task update" };
  }

  const { error } = await supabase.rpc("set_task_completion", {
    task_id: id,
    is_completed: status === "completed",
  });

  if (error) return { error: error.message };
  
  revalidatePath("/portal/timeline");
  revalidatePath("/portal");
  revalidatePath("/dashboard/timeline");
  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/projects");
  return { success: true };
}

export async function createGuest(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { success: true, demo: true };
  const context = await getClientProjectId(supabase);
  if ("error" in context) return { error: context.error };

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const guestGroup = String(formData.get("guest_group") || "").trim();
  const pax = Number(formData.get("pax") || 1);

  if (name.length < 2 || name.length > 120) return { error: "Nama tamu tidak valid" };
  if (!Number.isInteger(pax) || pax < 1 || pax > 20) return { error: "Jumlah tamu harus 1–20 orang" };

  const { error } = await supabase.from("guests").insert({
    project_id: context.projectId,
    name,
    phone: phone || null,
    guest_group: guestGroup || null,
    pax,
    status: "invited",
  });

  if (error) return { error: error.message };
  revalidatePath("/portal/guests");
  return { success: true };
}

export async function updateGuestStatus(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { success: true, demo: true };
  const context = await getClientProjectId(supabase);
  if ("error" in context) return { error: context.error };

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !["invited", "confirmed", "declined", "attended"].includes(status)) return { error: "Status tamu tidak valid" };

  const { error } = await supabase.from("guests").update({ status }).eq("id", id).eq("project_id", context.projectId);
  if (error) return { error: error.message };
  revalidatePath("/portal/guests");
  return { success: true };
}

export async function deleteGuest(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { success: true, demo: true };
  const context = await getClientProjectId(supabase);
  if ("error" in context) return { error: context.error };

  const id = String(formData.get("id") || "");
  if (!id) return { error: "Guest ID is required" };
  const { error } = await supabase.from("guests").delete().eq("id", id).eq("project_id", context.projectId);
  if (error) return { error: error.message };
  revalidatePath("/portal/guests");
  return { success: true };
}

export async function uploadClientDocument(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "Hubungkan Supabase untuk mengunggah dokumen" };
  const context = await getClientProjectId(supabase);
  if ("error" in context) return { error: context.error };

  const file = formData.get("file");
  const category = String(formData.get("category") || "general");
  const allowedCategories = ["kua", "contract", "payment", "brief", "general"];
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih file yang ingin diunggah" };
  if (file.size > 10 * 1024 * 1024) return { error: "Ukuran file maksimal 10 MB" };
  if (!allowedCategories.includes(category)) return { error: "Kategori dokumen tidak valid" };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  const path = `${context.projectId}/client/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage.from("project-files").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) return { error: uploadError.message };

  const { error: metadataError } = await supabase.from("files").insert({
    project_id: context.projectId,
    uploaded_by: context.user.id,
    name: file.name,
    path,
    type: file.type || null,
    size: file.size,
    category,
    visible_to_client: true,
  });

  if (metadataError) {
    await supabase.storage.from("project-files").remove([path]);
    return { error: metadataError.message };
  }

  revalidatePath("/portal/documents");
  return { success: true };
}

export async function deleteClientDocument(formData: FormData) {
  const supabase = await createClient();
  if (!supabase) return { error: "No DB connection" };
  const context = await getClientProjectId(supabase);
  if ("error" in context) return { error: context.error };

  const id = String(formData.get("id") || "");
  const { data: document } = await supabase
    .from("files")
    .select("id, path, uploaded_by")
    .eq("id", id)
    .eq("project_id", context.projectId)
    .eq("uploaded_by", context.user.id)
    .maybeSingle();
  if (!document) return { error: "Dokumen tidak ditemukan atau tidak dapat dihapus" };

  const { error: storageError } = await supabase.storage.from("project-files").remove([document.path]);
  if (storageError) return { error: storageError.message };
  const { error } = await supabase.from("files").delete().eq("id", document.id).eq("uploaded_by", context.user.id);
  if (error) return { error: error.message };

  revalidatePath("/portal/documents");
  return { success: true };
}
