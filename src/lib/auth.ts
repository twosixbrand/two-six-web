/**
 * Utilidades de autenticación para el frontend.
 * Centraliza el acceso al token JWT para evitar repetición
 * y garantizar que todas las llamadas autenticadas incluyan el header correcto.
 */

/**
 * Retorna los headers de autorización si el usuario tiene un token activo.
 * Usar en todas las llamadas fetch a endpoints protegidos.
 * 
 * @example
 * const response = await fetch(`${API_URL}/api/customer/${id}`, {
 *   headers: { ...getAuthHeaders() },
 * });
 */
export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('customerToken');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Retorna el ID del cliente autenticado, o null si no está logueado.
 */
export function getCustomerId(): number | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('customerData');
  if (!data) return null;
  try {
    const customer = JSON.parse(data);
    return customer.id || null;
  } catch {
    return null;
  }
}
