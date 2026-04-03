export interface SeoOverride {
  title: string;
  description: string;
  h1: string;
  alt: string;
  audience?: string; // e.g., 'Unisex', 'Femenino', 'Masculino'
}

export function getSeoOverrides(reference: string, colorName: string, gender: string = 'Unisex'): SeoOverride | null {
  const ref = reference?.toLowerCase().trim() || "";
  const color = colorName?.toLowerCase().trim() || "";

  // Helper para capitalizar color
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const colorCapitalized = capitalize(color);

  // REFERENCIA Q4A14 (Negro predominante)
  if (ref === "q4a14") {
    return {
      title: "Camiseta Negra Two Six - Estampado Naranja y Blanco | Crafted for Real Ones",
      description: 'Compra la Camiseta Estampada Two Six para hombre en color negro. Calidad premium con diseño exclusivo "Crafted for real ones". Envíos a todo el país.',
      h1: "Camiseta Masculina - Estampado Frontal y Manga (Black Edition)",
      alt: "Hombre vistiendo camiseta negra Two Six con logo naranja y eslogan Crafted for real ones",
      audience: "Masculino"
    };
  }

  // REFERENCIA Q4A15 (Negro predominante)
  if (ref === "q4a15") {
    return {
      title: "Camiseta City Skyline Two Six - Negro y Estampado Atardecer | Two Six",
      description: "Dale un toque urbano a tu estilo con la Camiseta City Skyline de Two Six. Diseño premium en negro con estampado frontal de silueta urbana. Crafted for real ones. ¡Cómprala hoy!",
      h1: "Camiseta Black - Edición City Skyline",
      alt: "Camiseta negra masculina Two Six con estampado cuadrado de edificios y cielo naranja atardecer",
      audience: "Masculino"
    };
  }

  // REFERENCIA q4a11 (Essentials Unisex)
  if (ref === "q4a11") {
    return {
      title: `Camiseta Essentials Unisex ${colorCapitalized} - Logo Gorila Minimalista | Two Six`,
      description: `Descubre la Camiseta Essentials de Two Six. Un básico premium de corte unisex en color ${color} con nuestro icónico gorila en el pecho. Comodidad y estilo para el diario. Crafted for real ones.`,
      h1: `Camiseta Essentials - Edición Unisex (${colorCapitalized})`,
      alt: `Camiseta básica ${color} unisex de Two Six con pequeño logo de gorila bordado en el pecho`,
      audience: "Unisex"
    };
  }

  // REFERENCIA q4a12 (Crop Top Femenino)
  if (ref === "q4a12") {
    let altText = `Crop Top ${color} para mujer Two Six estilo urbano con eslogan Crafted for real ones.`;
    
    if (color === "crudo" || color === "blanco") {
      altText = "Mujer usando Crop Top color crudo Two Six con estampado frontal blanco.";
    } else if (color === "negro") {
      altText = "Crop Top negro femenino Two Six diseño minimalista algodón premium.";
    } else if (color === "gris") {
      altText = "Crop Top gris marca Two Six para mujer estilo casual urbano.";
    }

    return {
      title: `Crop Top Estampado ${colorCapitalized} Two Six - Moda Urbana Femenina`,
      description: "Eleva tu estilo urbano con el Crop Top de Two Six. Disponible en 4 colores esenciales: Crudo, Negro, Café y Gris. Diseño cómodo con estampado frontal exclusivo. Crafted for real ones.",
      h1: `Crop Top Essentials - ${colorCapitalized} (Edición Femenina)`,
      alt: altText,
      audience: "Femenino"
    };
  }

  // REFERENCIA Q4A13 (Essentials Mujer)
  if (ref === "q4a13") {
    let altText = `Camiseta básica ${color} para mujer marca Two Six con logo minimalista del gorila.`;
    let titleColor = "Mujer " + colorCapitalized;
    
    if (color === "crudo" || color === "blanco") {
      altText = "Mujer usando camiseta blanca/cruda de Two Six con pequeño logo de gorila en el pecho y chaqueta de jean.";
      titleColor = "Mujer Cruda";
    } else if (color === "negro") {
      altText = "Camiseta básica negra para mujer marca Two Six con logo minimalista del gorila.";
      titleColor = "Mujer Negra";
    }

    return {
      title: `Camiseta Essentials ${titleColor} - Logo Gorila Minimalista | Two Six`,
      description: "Descubre la Camiseta Essentials para mujer de Two Six. Un básico premium con fit femenino en colores Negro y Crudo. Estilo minimalista con nuestro logo oficial del gorila. Crafted for real ones.",
      h1: `Camiseta Essentials - Edición Femenina (${colorCapitalized})`,
      alt: altText,
      audience: "Femenino"
    };
  }

  // REFERENCIA Q4A16 (Gorila en Espalda)
  if (ref === "q4a16") {
    const isBlanca = color === "crudo" || color === "blanco";
    const title = isBlanca 
      ? "Camiseta Blanca Two Six - Estampado Gorila en Espalda | Two Six"
      : `Camiseta ${colorCapitalized} Two Six - Estampado Gorila en Espalda | Two Six`;
      
    return {
      title: title,
      description: "Lleva el estilo auténtico de Two Six con nuestra camiseta premium. Destaca con el logo oficial del gorila estampado en la espalda. Crafted for real ones. Calidad y diseño de Medellín.",
      h1: `Camiseta ${colorCapitalized} - Edición Gorilla Logo (Espalda)`,
      alt: `Camiseta ${color} para ${gender} Two Six con ilustración de gorila con gorra amarilla estampada en la espalda`,
      audience: gender
    };
  }

  return null;
}
