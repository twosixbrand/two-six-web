"use server";

import { prisma } from "@/lib/db";

interface ErrorDetails {
  message: string;
  stack?: string;
}

export async function logError(details: ErrorDetails) {
  try {
    await prisma.errorLog.create({
      data: {
        message: details.message,
        stack: details.stack,
      },
    });
  } catch (dbError) {
    console.error("PANIC: Failed to log error to database.", dbError);
    console.error("Original error that was not logged:", details);
  }
}

