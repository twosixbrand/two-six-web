"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  text: string;
  pendingText: string;
}

export function SubmitButton({ text, pendingText }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-disabled={pending}
      className="w-full bg-accent text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {pending ? pendingText : text}
    </button>
  );
}
