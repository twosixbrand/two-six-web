"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const WhatsAppButton = () => {
  const pathname = usePathname();
  
  // Reemplaza este número con tu número de WhatsApp, incluyendo el código de país sin el '+'
  const phoneNumber = "573108777629";
  
  let message = "Hola, estoy interesado en sus productos."; // Mensaje pre-llenado opcional
  if (pathname === '/drop') {
    message = "¡Hola Two Six! 🔥 Estoy viendo el nuevo DROP en la web y me encantó la referencia en [Tela Fría/Catar]. ¿Me podrían ayudar con la talla? Mi estatura es ___ y peso ___.";
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform duration-300 hover:scale-110"
      aria-label="Contactar por WhatsApp"
    >
      <Image
        src="/whatsapp.svg"
        alt="WhatsApp"
        width={36}
        height={36}
        className="text-white/80 group-hover:text-accent"
      />
    </Link>
  );
};

export default WhatsAppButton;
