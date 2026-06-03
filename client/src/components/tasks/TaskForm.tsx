import { useEffect, useId, useState, type FormEvent } from "react";

import type { Task, TaskFormInput, TaskPriority } from "../../api/tasks.js";

const priorities: ReadonlyArray<{ readonly label: string; readonly value: TaskPriority }> = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
];

interface TaskFormValues {
  readonly description: string;
  readonly dueDate: string;
  readonly priority: TaskPriority;
  readonly title: string;
}

const emptyValues: TaskFormValues = {
  description: "",
  dueDate: "",
  priority: "MEDIUM",
  title: "",
};

export function TaskForm({
  error,
  isSubmitting,
  onCancelEdit,
  onSubmit,
  task,
}: {
  readonly error: string | null;
  readonly isSubmitting: boolean;
  readonly onCancelEdit: () => void;
  readonly onSubmit: (input: TaskFormInput) => Promise<void>;
  readonly task: Task | null;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dueDateId = useId();
  const priorityId = useId();
  const [values, setValues] = useState<TaskFormValues>(emptyValues);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    setClientError(null);

    if (!task) {
      setValues(emptyValues);
      return;
    }

    setValues({
      description: task.description ?? "",
      dueDate: task.dueDate ?? "",
      priority: task.priority,
      title: task.title,
    });
  }, [task]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = values.title.trim();

    if (!title) {
      setClientError("Title is required");
      return;
    }

    setClientError(null);
    try {
      await onSubmit({
        description: values.description.trim() || null,
        dueDate: values.dueDate || null,
        priority: values.priority,
        title,
      });
    } catch {
      return;
    }

    if (!task) {
      setValues(emptyValues);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{task ? "Edit task" : "New task"}</h2>
        {task ? (
          <button
            className="rounded-md border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
            onClick={onCancelEdit}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>

      <label className="block text-sm font-medium text-zinc-700" htmlFor={titleId}>
        Title
      </label>
      <input
        className="mt-1 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        id={titleId}
        maxLength={200}
        onChange={(event) => setValues({ ...values, title: event.target.value })}
        required
        type="text"
        value={values.title}
      />

      <label className="block text-sm font-medium text-zinc-700" htmlFor={descriptionId}>
        Description
      </label>
      <textarea
        className="mt-1 min-h-24 w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        id={descriptionId}
        maxLength={5000}
        onChange={(event) => setValues({ ...values, description: event.target.value })}
        value={values.description}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor={dueDateId}>
            Due date
          </label>
          <input
            className="mt-1 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            id={dueDateId}
            onChange={(event) => setValues({ ...values, dueDate: event.target.value })}
            type="date"
            value={values.dueDate}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor={priorityId}>
            Priority
          </label>
          <select
            className="mt-1 h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            id={priorityId}
            onChange={(event) =>
              setValues({ ...values, priority: event.target.value as TaskPriority })
            }
            value={values.priority}
          >
            {priorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {clientError || error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {clientError ?? error}
        </div>
      ) : null}

      <button
        className="h-10 w-full rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Saving" : task ? "Save changes" : "Add task"}
      </button>
    </form>
  );
}
