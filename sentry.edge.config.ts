// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://d51ddca3d26a4ccaee7608b40b9d8421@o4510955958304768.ingest.us.sentry.io/4510956033933312",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Disable sending user PII (Personally Identifiable Information) out of regulatory compliance (LOW-03)
  sendDefaultPii: false,

  beforeSend(event) {
    if (event.request) {
      delete event.request.cookies;
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      if (event.request.data) {
        // Redact potential PII from request body
        try {
          const bodyString = typeof event.request.data === 'string' 
            ? event.request.data 
            : JSON.stringify(event.request.data);
          
          if (bodyString.includes('email') || bodyString.includes('document')) {
            event.request.data = '[REDACTED PII]';
          }
        } catch (e) {
          // ignore serialization errors
        }
      }
    }
    return event;
  }
});
