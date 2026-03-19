// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://d51ddca3d26a4ccaee7608b40b9d8421@o4510955958304768.ingest.us.sentry.io/4510956033933312",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.3,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  // Filter out noise from bots and Next.js internal control-flow errors
  beforeSend(event) {
    const message = event.exception?.values?.[0]?.value || "";

    // Next.js internal control-flow — not real errors
    if (message === "NEXT_REDIRECT" || message === "NEXT_NOT_FOUND") {
      return null;
    }

    // Errors from POST requests sent by bots/crawlers to routes that don't
    // accept POST (malformed bodies, non-existent paths, etc.).
    const url = event.request?.url || "";
    if (event.request?.method === "POST") {
      // POST to root, /_not-found, or /_next/data/ paths — always bot noise
      if (
        url === "/" ||
        url.endsWith("twosixweb.com/") ||
        url.includes("/_not-found") ||
        url.includes("/_next/data/")
      ) {
        return null;
      }

      // SyntaxError from JSON.parse on any POST — malformed bot payload
      if (
        message.includes("Unexpected") &&
        message.includes("JSON")
      ) {
        return null;
      }
    }

    return event;
  },
});
