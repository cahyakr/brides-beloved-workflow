import { TimelineBoard } from "@/components/timeline-board";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TimelinePage() {
  const supabase = await createClient();
  if (!supabase) return <TimelineBoard initialTasks={[]} />;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      id, title, priority, status, start_date, due_date,
      task_assignees (
        profiles ( full_name )
      )
    `)
    .order('start_date', { ascending: true });

  const mappedTasks = (tasks || []).map((t, index) => {
    const people = (t.task_assignees || []).map((ta: any) => {
      const name = ta.profiles?.full_name || "Unknown";
      return name.split(" ").map((n: string) => n[0]).join("").substring(0,2).toUpperCase();
    });

    const row = index % 3;
    const statusMap: Record<string, string> = {
      "not_started": "Not Started",
      "in_progress": "In Progress",
      "in_review": "In Review",
      "revision": "Revision",
      "completed": "Complete"
    };

    return {
      id: t.id,
      title: t.title,
      start_date: t.start_date,
      due_date: t.due_date,
      row,
      priority: t.priority === "urgent" ? "High" : (t.priority === "high" ? "High" : (t.priority === "medium" ? "Medium" : "Low")),
      status: statusMap[t.status] || "Not Started",
      people
    };
  });

  return <TimelineBoard initialTasks={mappedTasks} />;
}
