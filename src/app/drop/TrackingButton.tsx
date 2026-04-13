"use client";

import { useRouter } from "next/navigation";

interface TrackingButtonProps {
  text: string;
  className?: string;
}

export default function TrackingButton({ text, className }: TrackingButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Dispare el evento Begin Checkout
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({ event: 'begin_checkout' });
    }

    // Navegar después de enviar el evento
    router.push('/catalog?tag=nuevo-drop');
  };

  return (
    <button onClick={handleClick} className={className}>
      {text}
    </button>
  );
}
