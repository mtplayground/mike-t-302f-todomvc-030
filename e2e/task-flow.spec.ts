import { expect, test, type APIRequestContext } from "@playwright/test";

test("creates, completes, filters, and deletes a task", async ({ page, request }) => {
  const title = `E2E task ${Date.now()}`;

  await deleteE2eTasks(request);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "todomvc-030" })).toBeVisible();

  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Description").fill("Created by the happy-path E2E flow");
  await page.getByLabel("Due date").fill("2026-12-31");
  await page.getByLabel("Priority").selectOption("HIGH");
  const createResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/tasks") && response.request().method() === "POST"
  );
  await page.getByRole("button", { name: "Add task" }).click();
  const createResponse = await createResponsePromise;
  expect(createResponse.ok()).toBe(true);

  const createdTask = page.locator("li").filter({ hasText: title });
  await expect(createdTask).toBeVisible();
  await expect(createdTask.getByText("High")).toBeVisible();
  await expect(createdTask.getByText("Dec 31, 2026")).toBeVisible();

  await createdTask.getByRole("checkbox", { name: `Mark completed: ${title}` }).click();
  await expect(createdTask.getByText("Completed")).toBeVisible();

  await page.getByRole("tab", { name: "Completed" }).click();
  await expect(page.locator("li").filter({ hasText: title })).toBeVisible();

  await page.getByRole("tab", { name: "Active" }).click();
  await expect(page.locator("li").filter({ hasText: title })).toHaveCount(0);

  await page.getByRole("tab", { name: "Completed" }).click();
  const completedTask = page.locator("li").filter({ hasText: title });
  await completedTask.getByRole("button", { name: "Delete" }).click();
  await expect(page.locator("li").filter({ hasText: title })).toHaveCount(0);

  await page.getByRole("tab", { name: "All" }).click();
  await expect(page.locator("li").filter({ hasText: title })).toHaveCount(0);
});

async function deleteE2eTasks(request: APIRequestContext): Promise<void> {
  const apiBaseUrl = process.env.E2E_API_BASE_URL ?? "http://127.0.0.1:8080";
  const response = await request.get(new URL("/tasks?status=all", apiBaseUrl).toString());
  expect(response.ok()).toBe(true);

  const body = (await response.json()) as {
    readonly tasks: ReadonlyArray<{ readonly id: string; readonly title: string }>;
  };

  await Promise.all(
    body.tasks
      .filter((task) => task.title.startsWith("E2E task "))
      .map((task) => request.delete(new URL(`/tasks/${task.id}`, apiBaseUrl).toString()))
  );
}
