import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { ApiError } from "./api/client.js";
import { getHealth } from "./api/health.js";
import {
  createTask,
  getTasks,
  updateTask,
  type Task,
  type TaskFormInput,
  type TaskStatusFilter,
} from "./api/tasks.js";
import { StatusFilterTabs } from "./components/tasks/StatusFilterTabs.js";
import { TaskForm } from "./components/tasks/TaskForm.js";
import { TaskList } from "./components/tasks/TaskList.js";

export function App() {
  const queryClient = useQueryClient();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all");
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => getHealth({ signal }),
    retry: 1,
    staleTime: 30_000,
  });
  const tasksQuery = useQuery({
    queryKey: ["tasks", statusFilter],
    queryFn: ({ signal }) => getTasks(statusFilter, { signal }),
    staleTime: 10_000,
  });
  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: async () => {
      setStatusFilter("all");
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { readonly id: string; readonly input: TaskFormInput }) =>
      updateTask(id, input),
    onSuccess: async () => {
      setEditingTask(null);
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const apiStatus =
    healthQuery.data?.status === "ok" ? "Online" : healthQuery.isError ? "Offline" : "Checking";
  const tasks = tasksQuery.data ?? [];
  const formError =
    createMutation.error || updateMutation.error
      ? formatApiError((createMutation.error ?? updateMutation.error) as Error)
      : null;

  async function handleTaskFormSubmit(input: TaskFormInput): Promise<void> {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask.id, input });
      return;
    }

    await createMutation.mutateAsync(input);
  }

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">todomvc-030</h1>
            <p className="mt-1 text-sm text-zinc-600">Task workspace</p>
          </div>
          <ApiStatusBadge status={apiStatus} />
        </header>

        <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="rounded-lg border border-zinc-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-base font-semibold">Tasks</h2>
              <StatusFilterTabs onChange={setStatusFilter} value={statusFilter} />
            </div>
            <TaskList
              error={tasksQuery.error ? formatApiError(tasksQuery.error) : null}
              isLoading={tasksQuery.isLoading}
              onEdit={setEditingTask}
              tasks={tasks}
            />
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <TaskForm
                error={formError}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
                onCancelEdit={() => setEditingTask(null)}
                onSubmit={handleTaskFormSubmit}
                task={editingTask}
              />
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4">
              <h2 className="text-base font-semibold">System</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">API</dt>
                  <dd className="font-medium text-zinc-800">{apiStatus}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-zinc-500">Shown</dt>
                  <dd className="font-medium text-zinc-800">{tasks.length}</dd>
                </div>
                {healthQuery.error ? (
                  <div className="border-t border-zinc-100 pt-3 text-xs leading-5 text-red-700">
                    {formatApiError(healthQuery.error)}
                  </div>
                ) : null}
              </dl>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function ApiStatusBadge({ status }: { readonly status: "Checking" | "Offline" | "Online" }) {
  const className =
    status === "Online"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Offline"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={`rounded-full border px-3 py-1 text-sm font-medium ${className}`}>
      {status}
    </span>
  );
}

function formatApiError(error: Error): string {
  if (error instanceof ApiError) {
    return `${error.status} ${error.statusText}`;
  }

  return error.message;
}
