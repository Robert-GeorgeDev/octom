// Next.js calls this for every error thrown while handling a server request
// (pages, API routes, server actions). We keep only a scrubbed message and the
// path, never the request body, headers or user.
export async function onRequestError(
  error: unknown,
  request: { path: string; method: string }
) {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { recordError } = await import("@/lib/error-log");
  const e = error as { message?: string; stack?: string; digest?: string };
  await recordError({
    source: "server",
    route: `${request.method} ${request.path}`,
    message: e?.message ?? "Unknown error",
    stack: e?.stack,
    digest: e?.digest,
  });
}
