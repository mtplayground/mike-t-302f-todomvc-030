import type { Task, TaskPriority } from "@prisma/client";

import { prisma } from "../db/prisma.js";

export type TaskStatusFilter = "active" | "all" | "completed";

export interface CreateTaskInput {
  readonly description: string | null;
  readonly dueDate: Date | null;
  readonly priority: TaskPriority;
  readonly title: string;
}

export interface TaskDto {
  readonly completed: boolean;
  readonly createdAt: string;
  readonly description: string | null;
  readonly dueDate: string | null;
  readonly id: string;
  readonly priority: TaskPriority;
  readonly title: string;
  readonly updatedAt: string;
}

export async function createTask(input: CreateTaskInput): Promise<TaskDto> {
  const task = await prisma.task.create({
    data: {
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      title: input.title,
    },
  });

  return toTaskDto(task);
}

export async function listTasks(status: TaskStatusFilter): Promise<TaskDto[]> {
  const tasks = await prisma.task.findMany({
    where: toStatusWhere(status),
    orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
  });

  return tasks.map(toTaskDto);
}

function toStatusWhere(status: TaskStatusFilter) {
  if (status === "active") {
    return { completed: false };
  }

  if (status === "completed") {
    return { completed: true };
  }

  return {};
}

function toTaskDto(task: Task): TaskDto {
  return {
    completed: task.completed,
    createdAt: task.createdAt.toISOString(),
    description: task.description,
    dueDate: task.dueDate ? formatDateOnly(task.dueDate) : null,
    id: task.id,
    priority: task.priority,
    title: task.title,
    updatedAt: task.updatedAt.toISOString(),
  };
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
