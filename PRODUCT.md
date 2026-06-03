# todomvc-030

## Snapshot

todomvc-030 is a full-stack task management app built as a TypeScript monorepo. It provides a React single-page task workspace backed by an Express API and PostgreSQL persistence through Prisma.

## What It Does

- Create, list, edit, complete, and delete tasks.
- Track task title, optional description, optional due date, priority, completion state, and timestamps.
- Filter tasks by All, Active, and Completed.
- Show task metadata in the UI, including due date, priority, and status.
- Provide optimistic UI updates for complete toggles and deletes.

## Architecture

- Root workspace manages `client` and `server` npm workspaces.
- `client` is a Vite React app using Tailwind CSS and TanStack React Query.
- `server` is an Express API using centralized error handling and Zod request validation.
- PostgreSQL is the only persistent store. Prisma owns database access and migrations.
- The Express server serves API routes and, after `npm run build`, serves the built React app from `client/dist`.

## API Surface

- `GET /health` returns API health.
- `GET /tasks?status=all|active|completed` lists tasks.
- `POST /tasks` creates a task.
- `PATCH /tasks/:id` updates task fields and completion state.
- `DELETE /tasks/:id` deletes a task.

## Conventions

- Runtime configuration comes from environment variables; `DATABASE_URL` must be PostgreSQL.
- `.env.example` documents required and optional variables.
- Server listens on `0.0.0.0:8080` by default.
- Root scripts are the primary entry points:
  - `npm run build`
  - `npm test`
  - `npm run test:e2e`
  - `npm start`
- `npm start` runs Prisma migrations before starting the built server.

## Test Coverage

- Backend service and route tests cover CRUD, filtering, and validation errors.
- Frontend component tests cover list rendering, filters, forms, toggles, and deletes.
- Playwright E2E covers the happy path: create, complete, filter, and delete.
