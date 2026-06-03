import { Router } from "express";

import { validateRequest } from "../middleware/validate-request.js";
import { createTask, listTasks } from "../services/tasks.js";
import {
  createTaskBodySchema,
  listTasksQuerySchema,
  type CreateTaskBody,
  type ListTasksQuery,
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
