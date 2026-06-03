import { afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";

import { createApp } from "../app.js";
import { prisma } from "../db/prisma.js";
import { cleanupTasks, routeTestPrefix } from "../test/task-test-utils.js";

const app = createApp();

describe("task routes", () => {
  beforeEach(async () => {
    await cleanupTasks(routeTestPrefix);
  });

  afterAll(async () => {
    await cleanupTasks(routeTestPrefix);
    await prisma.$disconnect();
  });

  it("supports task CRUD and status filtering", async () => {
    const createResponse = await request(app)
      .post("/tasks")
      .send({
        title: `${routeTestPrefix}created`,
        description: "created through the API",
        dueDate: "2026-11-03",
        priority: "LOW",
      })
      .expect(201);

    const createdTask = createResponse.body.task;
    expect(createdTask).toMatchObject({
      title: `${routeTestPrefix}created`,
      description: "created through the API",
      priority: "LOW",
      completed: false,
    });
    expect(createdTask.id).toEqual(expect.any(String));

    const activeResponse = await request(app).get("/tasks").query({ status: "active" }).expect(200);
    expect(
      activeResponse.body.tasks.some((task: { id: string }) => task.id === createdTask.id)
    ).toBe(true);

    const patchResponse = await request(app)
      .patch(`/tasks/${createdTask.id}`)
      .send({
        title: `${routeTestPrefix}updated`,
        description: null,
        dueDate: null,
        priority: "HIGH",
        completed: true,
      })
      .expect(200);

    expect(patchResponse.body.task).toMatchObject({
      id: createdTask.id,
      title: `${routeTestPrefix}updated`,
      description: null,
      dueDate: null,
      priority: "HIGH",
      completed: true,
    });

    const completedResponse = await request(app)
      .get("/tasks")
      .query({ status: "completed" })
      .expect(200);
    expect(
      completedResponse.body.tasks.some((task: { id: string }) => task.id === createdTask.id)
    ).toBe(true);

    await request(app).delete(`/tasks/${createdTask.id}`).expect(204);

    const notFoundResponse = await request(app)
      .patch(`/tasks/${createdTask.id}`)
      .send({ completed: false })
      .expect(404);
    expect(notFoundResponse.body.error).toMatchObject({
      code: "TASK_NOT_FOUND",
    });
  });

  it("returns validation errors for invalid task requests", async () => {
    const invalidCreateResponse = await request(app)
      .post("/tasks")
      .send({ title: "", priority: "LOW" })
      .expect(400);
    expect(invalidCreateResponse.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
    });

    const invalidListResponse = await request(app)
      .get("/tasks")
      .query({ status: "done" })
      .expect(400);
    expect(invalidListResponse.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
    });

    const invalidDeleteResponse = await request(app).delete("/tasks/not-a-uuid").expect(400);
    expect(invalidDeleteResponse.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
    });

    const invalidPatchResponse = await request(app)
      .patch("/tasks/11111111-1111-4111-8111-111111111111")
      .send({})
      .expect(400);
    expect(invalidPatchResponse.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
    });
  });
});
