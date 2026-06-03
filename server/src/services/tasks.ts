import type { Task, TaskPriority } from "@prisma/client";

import { prisma } from "../db/prisma.js";
import { AppError } from "../errors/app-error.js";

export type TaskStatusFilter = "active" | "all" | "completed";

export interface CreateTaskInput {
  readonly description: string | null;
  readonly dueDate: Date | null;
  readonly priority: TaskPriority;
  readonly title: string;
}

export interface UpdateTaskInput {
  readonly completed?: boolean;
  readonly description?: string | null;
  readonly dueDate?: Date | null;
  readonly priority?: TaskPriority;
  readonly title?: string;
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

export async function updateTask(id: string, input: UpdateTaskInput): Promise<TaskDto> {
  await ensureTaskExists(id);

  const task = await prisma.task.update({
    where: { id },
    data: input,
  });

  return toTaskDto(task);
}

export async function deleteTask(id: string): Promise<void> {
  await ensureTaskExists(id);
  await prisma.task.delete({ where: { id } });
}

async function ensureTaskExists(id: string): Promise<void> {
  const task = await prisma.task.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!task) {
    throw new AppError("Task was not found", {
      code: "TASK_NOT_FOUND",
      statusCode: 404,
    });
  }
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
