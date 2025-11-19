import type { Product } from "@/types";
import { logError } from "@/lib/actions/error";
import { apiClient } from "@/lib/api-client";

export const getProducts = async (options?: {
  gender?: Product["gender"];
  take?: number;
  isOutlet?: boolean;
}): Promise<Product[]> => {
  try {
    // Construimos los parámetros de forma limpia, eliminando los indefinidos.
    const params: Record<string, string | number | boolean> = {};
    if (options?.gender) params.gender = options.gender;
    if (options?.take) params.take = options.take;
    if (typeof options?.isOutlet === "boolean")
      params.isOutlet = options.isOutlet;

    return await apiClient<Product[]>("/products", { params });
  } catch (error) {
    console.error(error);
    await logError({
      message: `Fallo en getProducts con opciones: ${JSON.stringify(options)}`,
      stack: error instanceof Error ? error.stack : String(error),
    });
    return [];
  }
};

export const getProductsByGender = async (
  gender: Product["gender"]
): Promise<Product[]> => {
  try {
    return await getProducts({ gender });
  } catch (error) {
    console.error(error);
    await logError({
      message: `Fallo en getProductsByGender para el género: ${gender}`,
      stack: error instanceof Error ? error.stack : String(error),
    });
    return [];
  }
};

export const getProductById = async (id: number): Promise<Product | null> => {
  try {
    console.log("id:",id);
    return await apiClient<Product>(`/products/${id}`);
  } catch (error) {
    // El nuevo apiClient lanzará un error que podemos inspeccionar.
    // Si el backend devuelve 404, el error lo indicará.
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }

    console.error(error);
    await logError({
      message: `Fallo en getProductById para el id: ${id}`,
      stack: error instanceof Error ? error.stack : String(error),
    });
    return null;
  }
};

export async function getProductsByDesignReference(
  reference: string
): Promise<Product[]> {
  try {
    // Ahora esta función llama a nuestra nueva API route
    return await apiClient<Product[]>(`/products/by-reference/${reference}`);
  } catch (error) {
    console.error(
      `Error al obtener variantes para la referencia ${reference}:`,
      error
    );
    await logError({
      message: `Fallo en getProductsByDesignReference para la referencia: ${reference}`,
      stack: error instanceof Error ? error.stack : String(error),
    });
    return [];
  }
}
