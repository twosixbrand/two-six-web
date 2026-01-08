import { getProductById, getProductsByDesignReference } from "@/data/products";
import ProductDetail from "@/components/ProductDetail";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";

// Esta función genera metadatos dinámicos para el <head> de la página
// Se ejecuta en el servidor, por lo que no puede estar en un archivo "use client".
// Esta función genera metadatos dinámicos para el <head> de la página
// Se ejecuta en el servidor, por lo que no puede estar en un archivo "use client".
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id: idString } = await params;
  const id = Number(idString);

  // Si el ID no es un número, no intentes buscar el producto.
  if (isNaN(id)) {
    return { title: "Página no encontrada" };
  }

  const product = await getProductById(id);
  if (!product) {
    return {
      title: "Producto no encontrado",
    };
  }

  return {
    title: `${product.name} | Two Six Brand`,
    description: product.description,
  };
}

// Este es el componente de página (Server Component).
export default async function ProductDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }

  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  const variants = await getProductsByDesignReference(product.clothingSize.clothingColor.design.reference);

  const genderMap: { [key: string]: string } = {
    'femenino': 'woman',
    'masculino': 'man',
    'unisex': 'unisex',
  };

  const gender = product.clothingSize.clothingColor.design.clothing.gender;
  const genderSlug = genderMap[gender.toLowerCase()] || gender.toLowerCase();
  console.log("category", product.clothingSize.clothingColor.design.clothing);
  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: gender, href: `/${genderSlug}` },
    { label: product.clothingSize.clothingColor.design.clothing.name, href: `/${genderSlug}` }, // Asumiendo que la URL se basa en el género

  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <ProductDetail initialProduct={product} variants={variants} />
    </div>
  );
}
