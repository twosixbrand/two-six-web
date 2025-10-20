"use client";

import Link from 'next/link';

const WhatsAppButton = () => {
  // Reemplaza este número con tu número de WhatsApp, incluyendo el código de país sin el '+'
  const phoneNumber = "573013975582"; 
  const message = "Hola, estoy interesado en sus productos."; // Mensaje pre-llenado opcional

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform duration-300 hover:scale-110"
      aria-label="Contactar por WhatsApp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM12.04 20.15h-.01c-1.5 0-2.96-.4-4.24-1.14l-.3-.18-3.15.82.84-3.08-.2-.32a8.03 8.03 0 01-1.22-4.38c0-4.42 3.6-8.02 8.02-8.02s8.02 3.6 8.02 8.02-3.6 8.02-8.02 8.02zm4.53-6.13c-.27-.13-1.59-.78-1.84-.87-.25-.09-.43-.13-.62.13-.19.26-.7.87-.86 1.04-.16.17-.32.19-.59.06-.27-.13-1.14-.42-2.17-1.33-.81-.71-1.36-1.59-1.52-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.3.4-.4.13-.1.17-.17.25-.28.08-.11.04-.21-.02-.34s-.62-1.49-.85-2.04c-.23-.55-.46-.48-.62-.48h-.5c-.16 0-.43.06-.62.3.19.23-.7 2.12-.7 2.12s-.7 2.44.7 4.8c1.4 2.36 3.43 3.01 3.91 3.2.48.19.91.16 1.26.1.39-.06 1.59-1.04 1.81-1.45.22-.41.22-.76.16-.89z" />
      </svg>
    </Link>
  );
};

export default WhatsAppButton;