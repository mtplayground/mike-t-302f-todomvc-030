import { Router } from "express";

import { validateRequest } from "../middleware/validate-request.js";
import { createTask, deleteTask, listTasks, updateTask } from "../services/tasks.js";
import {
  createTaskBodySchema,
  listTasksQuerySchema,
  taskParamsSchema,
  updateTaskBodySchema,
  type CreateTaskBody,
  type ListTasksQuery,
  type TaskParams,
  type UpdateTaskBody,
} from "../validation/tasks.js";

export const tasksRouter = Router();

tasksRouter.get(
  "/",
  validateRequest({ query: listTasksQuerySchema }),
  async (request, response) => {
    const query = listTasksQuerySchema.parse(request.query) as ListTasksQuery;
    const tasks = await listTasks(query.status);

    response.status(200).json({ tasks });
  }
);

tasksRouter.post(
  "/",
  validateRequest({ body: createTaskBodySchema }),
  async (request, response) => {
    const body = request.body as CreateTaskBody;
    const task = await createTask(body);

    response.status(201).json({ task });
  }
);

tasksRouter.patch(
  "/:id",
  validateRequest({ body: updateTaskBodySchema, params: taskParamsSchema }),
  async (request, response) => {
    const params = request.params as TaskParams;
    const body = request.body as UpdateTaskBody;
    const task = await updateTask(params.id, body);

    response.status(200).json({ task });
  }
);

tasksRouter.delete(
  "/:id",
  validateRequest({ params: taskParamsSchema }),
  async (request, response) => {
    const params = request.params as TaskParams;
    await deleteTask(params.id);

    response.status(204).send();
  }
);
