import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Task } from "../../api/tasks.js";
import { TaskForm } from "./TaskForm.js";

const editableTask: Task = {
  completed: false,
  createdAt: "2026-06-01T00:00:00.000Z",
  description: "Existing description",
  dueDate: "2026-06-20",
  id: "33333333-3333-4333-8333-333333333333",
  priority: "LOW",
  title: "Existing task",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

describe("TaskForm", () => {
  it("submits normalized values for a new task", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderTaskForm({ onSubmit });

    await user.type(screen.getByLabelText("Title"), "  Ship component tests  ");
    await user.type(screen.getByLabelText("Description"), "  Validate important UI behavior  ");
    await user.type(screen.getByLabelText("Due date"), "2026-06-25");
    await user.selectOptions(screen.getByLabelText("Priority"), "HIGH");
    await user.click(screen.getByRole("button", { name: "Add task" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        description: "Validate important UI behavior",
        dueDate: "2026-06-25",
        priority: "HIGH",
        title: "Ship component tests",
      });
    });

    expect(screen.getByLabelText("Title")).toHaveValue("");
  });

  it("preloads edit values and submits updates", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onCancelEdit = vi.fn();

    renderTaskForm({ onCancelEdit, onSubmit, task: editableTask });

    expect(screen.getByRole("heading", { name: "Edit task" })).toBeInTheDocument();
    expect(screen.getByLabelText("Title")).toHaveValue("Existing task");
    expect(screen.getByLabelText("Description")).toHaveValue("Existing description");
    expect(screen.getByLabelText("Due date")).toHaveValue("2026-06-20");
    expect(screen.getByLabelText("Priority")).toHaveValue("LOW");

    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Updated task");
    await user.selectOptions(screen.getByLabelText("Priority"), "MEDIUM");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        description: "Existing description",
        dueDate: "2026-06-20",
        priority: "MEDIUM",
        title: "Updated task",
      });
    });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });

  it("shows client validation when title is blank", async () => {
    const onSubmit = vi.fn();

    renderTaskForm({ onSubmit });

    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "   " } });
    const submitButton = screen.getByRole("button", { name: "Add task" });
    const form = submitButton.closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

function renderTaskForm({
  error = null,
  isSubmitting = false,
  onCancelEdit = vi.fn(),
  onSubmit = vi.fn().mockResolvedValue(undefined),
  task = null,
}: {
  readonly error?: string | null;
  readonly isSubmitting?: boolean;
  readonly onCancelEdit?: () => void;
  readonly onSubmit?: (input: {
    readonly description: string | null;
    readonly dueDate: string | null;
    readonly priority: "HIGH" | "LOW" | "MEDIUM";
    readonly title: string;
  }) => Promise<void>;
  readonly task?: Task | null;
}) {
  return render(
    <TaskForm
      error={error}
      isSubmitting={isSubmitting}
      onCancelEdit={onCancelEdit}
      onSubmit={onSubmit}
      task={task}
    />
  );
}
