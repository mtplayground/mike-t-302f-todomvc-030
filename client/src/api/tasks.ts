import { apiRequest } from "./client.js";

export type TaskPriority = "HIGH" | "LOW" | "MEDIUM";
export type TaskStatusFilter = "active" | "all" | "completed";

export interface Task {
  readonly completed: boolean;
  readonly createdAt: string;
  readonly description: string | null;
  readonly dueDate: string | null;
  readonly id: string;
  readonly priority: TaskPriority;
  readonly title: string;
  readonly updatedAt: string;
}

interface ListTasksResponse {
  readonly tasks: Task[];
}

export async function getTasks(
  status: TaskStatusFilter,
  options: { readonly signal?: AbortSignal } = {}
): Promise<Task[]> {
  const params = new URLSearchParams({ status });
  const response = await apiRequest<ListTasksResponse>(`/tasks?${params.toString()}`, {
    signal: options.signal,
  });

  return response.tasks;
}
