FROM node:18-alpine AS base

# Fase 1: Instalar dependencias
FROM base AS deps
# Compatibilidad extra requerida para alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copia los archivos de manifiesto e instala
COPY package.json package-lock.json* ./
RUN npm ci

# Fase 2: Construir el código fuente (Next.js Build)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilita telemetría para acelerar build y ahorrar memoria
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Fase 3: Imagen Final de Producción (Minimalista)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Solo copiamos la salida 'standalone' que es ultra ligera (~150MB) 
# y la carpeta static necesaria para el render.
COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copia el build standalone. ¡Magia!
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiamos al usuario sin privilegios por seguridad
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Este server.js es generado por la opción 'standalone' de Next.js
CMD ["node", "server.js"]
