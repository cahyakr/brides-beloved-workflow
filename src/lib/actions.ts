"use server";

import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";

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
