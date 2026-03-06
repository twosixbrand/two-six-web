import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError: typeof Sentry.captureRequestError = (
  error,
  request,
  errorContext,
) => {
  // Next.js throws NEXT_REDIRECT and NEXT_NOT_FOUND as internal control flow
  // errors — they are not real application errors and should not be reported.
  if (
    error instanceof Error &&
    (error.message === "NEXT_REDIRECT" || error.message === "NEXT_NOT_FOUND")
  ) {
    return;
  }

  Sentry.captureRequestError(error, request, errorContext);
};
