import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

export const debugLog = (...args: unknown[]) => {
  if (isDev) console.log(...args);
};

export const debugError = (...args: unknown[]) => {
  if (isDev || (isTest && process.env.VERBOSE_TEST_LOGS)) {
    console.error(...args);
  }
};

export const debugWarn = (...args: unknown[]) => {
  if (isDev || (isTest && process.env.VERBOSE_TEST_LOGS)) {
    console.warn(...args);
  }
};
