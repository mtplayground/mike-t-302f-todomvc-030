import { z } from "zod";

import { TaskPriority } from "@prisma/client";

const priorityValues = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH] as const;

const dateOnlySchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must use YYYY-MM-DD format")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Due date must be a valid calendar date")
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

export const createTaskBodySchema = z.object({
  description: z
    .string()
    .trim()
    .max(5000)
    .nullable()
    .optional()
    .transform((value) => value || null),
  dueDate: dateOnlySchema
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  priority: z.enum(priorityValues).default(TaskPriority.MEDIUM),
  title: z.string().trim().min(1).max(200),
});

export const listTasksQuerySchema = z.object({
  status: z.enum(["all", "active", "completed"]).default("all"),
});

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
