import { useQuery } from "@tanstack/react-query";

import { ApiError } from "./api/client.js";
import { getHealth } from "./api/health.js";

export function App() {
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => getHealth({ signal }),
    retry: 1,
    staleTime: 30_000,
  });

  const apiStatus =
    healthQuery.data?.status === "ok" ? "Online" : healthQuery.isError ? "Offline" : "Checking";

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">todomvc-030</h1>
            <p className="mt-1 text-sm text-zinc-600">Task workspace</p>
          </div>
          <ApiStatusBadge status={apiStatus} />
        </header>

        <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="rounded-lg border border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <h2 className="text-base font-semibold">Tasks</h2>
              <span className="text-sm text-zinc-500">All</span>
            </div>
            <div className="flex min-h-72 items-center justify-center px-4 py-12 text-center text-sm text-zinc-500">
              No tasks yet.
            </div>
          </div>

          <aside className="rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="text-base font-semibold">System</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-zinc-500">API</dt>
                <dd className="font-medium text-zinc-800">{apiStatus}</dd>
              </div>
              {healthQuery.error ? (
                <div className="border-t border-zinc-100 pt-3 text-xs leading-5 text-red-700">
                  {formatApiError(healthQuery.error)}
                </div>
              ) : null}
            </dl>
          </aside>
        </section>
      </div>
    </main>
  );
}

function ApiStatusBadge({ status }: { readonly status: "Checking" | "Offline" | "Online" }) {
  const className =
    status === "Online"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Offline"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={`rounded-full border px-3 py-1 text-sm font-medium ${className}`}>
      {status}
    </span>
  );
}

function formatApiError(error: Error): string {
  if (error instanceof ApiError) {
    return `${error.status} ${error.statusText}`;
  }

  return error.message;
}
