const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('La variable de entorno NEXT_PUBLIC_API_URL no está definida.');
}

type FetchOptions = RequestInit & {
  params?: Record<string, string | number | boolean>;
};

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;
  const url = new URL(`${API_URL}/api${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const urlString = url.toString();

  try {
    const response = await fetch(urlString, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la API: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`Fallo al hacer fetch a: ${urlString}`);
    // Re-lanzamos el error original para no perder el stack trace
    throw error;
  }
}