import type { Product } from "@/types";
import type { StoreDesign } from "@/types/store";
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
      params.is_outlet = options.isOutlet;

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

export async function getProductById(id: number): Promise<Product | null> {
  try {

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

export async function getProductsBySlug(
  slug: string
): Promise<{ products: Product[], colorId: number | null }> {
  try {
    return await apiClient<{ products: Product[], colorId: number | null }>(`/products/by-slug/${slug}`);
  } catch (error) {
    console.error(`Error al obtener productos por slug ${slug}:`, error);
    await logError({
      message: `Fallo en getProductsBySlug para el slug: ${slug}`,
      stack: error instanceof Error ? error.stack : String(error),
    });
    return { products: [], colorId: null };
  }
}

export interface PaginatedStoreDesigns {
  data: StoreDesign[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export const getStoreDesigns = async (options?: {
  gender?: string;
  isOutlet?: boolean;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedStoreDesigns> => {
  try {
    const params: Record<string, string | boolean | number> = {};
    if (options?.gender) params.gender = options.gender;
    if (typeof options?.isOutlet === "boolean") params.is_outlet = options.isOutlet;
    if (options?.category) params.category = options.category;
    if (options?.tag) params.tag = options.tag;
    if (options?.page) params.page = options.page;
    if (options?.limit) params.limit = options.limit;

    return await apiClient<PaginatedStoreDesigns>("/products/store/designs", { params });
  } catch (error) {
    console.error(error);
    await logError({
      message: `Fallo en getStoreDesigns con opciones: ${JSON.stringify(options)}`,
      stack: error instanceof Error ? error.stack : String(error),
    });
    return { data: [], meta: { total: 0, page: 1, totalPages: 1, limit: 12 } };
  }
};
