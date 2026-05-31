import { supabase } from "@/lib/supabase";
import type { Task } from "@/types";

// Convert database row to Task type
function taskRowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    leadId: row.lead_id,
    eventId: row.event_id,
    assignedTo: row.assigned_to,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date,
    createdAt: row.created_at,
    createdBy: row.created_by || "",
  };
}

// Convert Task type to database row
function taskToRow(task: Partial<Task>) {
  return {
    title: task.title,
    description: task.description,
    lead_id: task.leadId,
    event_id: task.eventId,
    assigned_to: task.assignedTo,
    priority: task.priority,
    status: task.status,
    due_date: task.dueDate,
    created_by: task.createdBy,
  };
}

export const tasksApi = {
  async getAll(): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(taskRowToTask);
  },

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data ? taskRowToTask(data) : null;
  },

  async getByEventId(eventId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(taskRowToTask);
  },

  async getByLeadId(leadId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(taskRowToTask);
  },

  async create(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert([taskToRow(task)])
      .select()
      .single();

    if (error) throw error;
    return taskRowToTask(data);
  },

  async update(id: string, task: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update(taskToRow(task))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return taskRowToTask(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};

// Legacy exports for backward compatibility
export const getTasks = tasksApi.getAll;
export const getTaskById = tasksApi.getById;
export const createTask = tasksApi.create;
export const updateTask = tasksApi.update;
export const deleteTask = tasksApi.delete;
