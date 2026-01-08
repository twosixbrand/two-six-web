"use client";

import { useEffect } from "react";
import { logError } from "@/lib/actions/error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError({
      message: `Global Error: ${error.message}`,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="container mx-auto px-6 py-12 text-center">
      <h2 className="text-2xl font-bold text-primary mb-4">Algo salió mal</h2>
      <p className="text-gray-700 mb-6">
        Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta de nuevo.
      </p>
      <button onClick={() => reset()} className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-hover">Intentar de nuevo</button>
    </div>
  );
}