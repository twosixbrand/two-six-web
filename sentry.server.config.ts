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

    // Errors from POST requests to routes without server actions (bots/crawlers
    // sending malformed requests). The root "/" has no POST handler, so any
    // SyntaxError, TypeError, etc. from POST / is guaranteed to be bot noise.
    if (
      event.request?.method === "POST" &&
      (event.request?.url === "/" ||
        event.request?.url?.endsWith("twosixweb.com/"))
    ) {
      return null;
    }

    return event;
  },
});
