import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verifica si el modo de mantenimiento está activo
  // IMPORTANTE: Se lee dinámicamente en runtime (sin NEXT_PUBLIC)
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  const url = request.nextUrl.clone();
  
  // Excluir recursos estáticos, la API del framework y la página misma de mantenimiento
  const isApiRoute = url.pathname.startsWith('/api/');
  const isStaticResource = url.pathname.startsWith('/_next/') || url.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/i);
  const isAlreadyMaintenance = url.pathname === '/mantenimiento';

  if (isMaintenanceMode && !isApiRoute && !isStaticResource && !isAlreadyMaintenance) {
    // Redirige transparentemente (rewrite) a la ruta de mantenimiento sin cambiar la URL visible al usuario
    url.pathname = '/mantenimiento';
    return NextResponse.rewrite(url);
  }

  // Si el mantenimiento está apagado, pero alguien entra manualmente a la ruta /mantenimiento,
  // devuélvelo al inicio para no confundirlo.
  if (!isMaintenanceMode && isAlreadyMaintenance) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Evaluar en todas partes excepto los archivos core del sistema de React/Next
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
