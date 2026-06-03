import { z } from "zod";

import { TaskPriority } from "@prisma/client";

const priorityValues = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH] as const;

const descriptionSchema = z.string().trim().max(5000).nullable();

const dateOnlySchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must use YYYY-MM-DD format")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, "Due date must be a valid calendar date")
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

const dueDateSchema = dateOnlySchema.nullable();
const titleSchema = z.string().trim().min(1).max(200);

export const createTaskBodySchema = z.object({
  description: descriptionSchema.optional().transform((value) => value || null),
  dueDate: dueDateSchema.optional().transform((value) => value ?? null),
  priority: z.enum(priorityValues).default(TaskPriority.MEDIUM),
  title: titleSchema,
});

export const listTasksQuerySchema = z.object({
  status: z.enum(["all", "active", "completed"]).default("all"),
});

export const taskParamsSchema = z.object({
  id: z.string().uuid(),
});

export const updateTaskBodySchema = z
  .object({
    completed: z.boolean().optional(),
    description: descriptionSchema.optional().transform((value) => {
      if (value === "") {
        return null;
      }

      return value;
    }),
    dueDate: dueDateSchema.optional(),
    priority: z.enum(priorityValues).optional(),
    title: titleSchema.optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "At least one task field must be provided",
  });

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type TaskParams = z.infer<typeof taskParamsSchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskBodySchema>;
