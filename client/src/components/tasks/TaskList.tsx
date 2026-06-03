import type { Task, TaskPriority } from "../../api/tasks.js";

export function TaskList({
  error,
  isLoading,
  onEdit,
  tasks,
}: {
  readonly error: string | null;
  readonly isLoading: boolean;
  readonly onEdit: (task: Task) => void;
  readonly tasks: readonly Task[];
}) {
  if (isLoading) {
    return (
      <ul className="divide-y divide-zinc-100">
        {Array.from({ length: 4 }).map((_, index) => (
          <li className="px-4 py-4" key={index}>
            <div className="h-4 w-2/3 rounded bg-zinc-100" />
            <div className="mt-3 flex gap-2">
              <div className="h-6 w-20 rounded-full bg-zinc-100" />
              <div className="h-6 w-24 rounded-full bg-zinc-100" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-72 items-center justify-center px-4 py-12 text-center text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex min-h-72 items-center justify-center px-4 py-12 text-center text-sm text-zinc-500">
        No tasks match this filter.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100">
      {tasks.map((task) => (
        <li className="px-4 py-4" key={task.id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 rounded-full ${
                    task.completed ? "bg-emerald-500" : "bg-zinc-300"
                  }`}
                />
                <h3
                  className={`truncate text-sm font-semibold ${
                    task.completed ? "text-zinc-500 line-through" : "text-zinc-950"
                  }`}
                >
                  {task.title}
                </h3>
              </div>
              {task.description ? (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                  {task.description}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
                {task.dueDate ? formatDueDate(task.dueDate) : "No due date"}
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${priorityClassName(
                  task.priority
                )}`}
              >
                {formatPriority(task.priority)}
              </span>
              <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600">
                {task.completed ? "Completed" : "Active"}
              </span>
              <button
                className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
                onClick={() => onEdit(task)}
                type="button"
              >
                Edit
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatDueDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatPriority(priority: TaskPriority): string {
  return priority[0] + priority.slice(1).toLowerCase();
}

function priorityClassName(priority: TaskPriority): string {
  if (priority === "HIGH") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (priority === "MEDIUM") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}
