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

export interface TaskFormInput {
  readonly description: string | null;
  readonly dueDate: string | null;
  readonly priority: TaskPriority;
  readonly title: string;
}

export interface TaskUpdateInput extends Partial<TaskFormInput> {
  readonly completed?: boolean;
}

interface ListTasksResponse {
  readonly tasks: Task[];
}

interface TaskResponse {
  readonly task: Task;
}

export async function createTask(input: TaskFormInput): Promise<Task> {
  const response = await apiRequest<TaskResponse>("/tasks", {
    body: input,
    method: "POST",
  });

  return response.task;
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

export async function updateTask(id: string, input: TaskUpdateInput): Promise<Task> {
  const response = await apiRequest<TaskResponse>(`/tasks/${id}`, {
    body: input,
    method: "PATCH",
  });

  return response.task;
}

export async function deleteTask(id: string): Promise<void> {
  await apiRequest<void>(`/tasks/${id}`, {
    method: "DELETE",
  });
}
