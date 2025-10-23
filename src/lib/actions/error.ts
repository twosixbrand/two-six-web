"use server";

import { apiClient } from "@/lib/api-client";

interface ErrorDetails {
  message: string;
  stack?: string;
}

export async function logError(details: ErrorDetails) {
  try {
    await apiClient('/logs/error', {
      method: 'POST',
      body: JSON.stringify({
        message: details.message,
        stack: details.stack ?? 'No stack trace available',
      }),
    });
  } catch (apiError) {
    console.error("PANIC: Failed to log error to API.", apiError);
    console.error("Original error that was not logged:", details);
  }
}
