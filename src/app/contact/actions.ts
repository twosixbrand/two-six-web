"use server";

import { logError } from "@/lib/actions/error";
import nodemailer from "nodemailer";
import { headers } from "next/headers";

/**
 * Escapa caracteres HTML peligrosos para prevenir inyección HTML en emails.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface FormState {
  success: boolean;
  message: string;
}

// ─── Capa 3: Rate Limit en memoria (máx 3 envíos/minuto por IP) ───
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

// Limpieza periódica para evitar memory leak (cada 5 min)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, 5 * 60_000);

export async function sendContactEmail(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  // ─── Capa 1: Honeypot ───
  // Si el campo oculto "website" tiene valor, es un bot
  const honeypot = formData.get("website") as string;
  if (honeypot) {
    // Respondemos con éxito falso para no alertar al bot
    console.warn("[AntiBot] Honeypot activado. Envío bloqueado.");
    return { success: true, message: "¡Mensaje enviado con éxito!" };
  }

  // ─── Capa 2: Time Trap ───
  // Si el formulario se envía en menos de 3 segundos, es sospechoso
  const formLoadedAt = formData.get("_ts") as string;
  if (formLoadedAt) {
    const elapsed = Date.now() - Number(formLoadedAt);
    if (elapsed < 3000) {
      console.warn(`[AntiBot] Time Trap activado (${elapsed}ms). Envío bloqueado.`);
      return { success: true, message: "¡Mensaje enviado con éxito!" };
    }
  }

  // ─── Capa 3: Rate Limit ───
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    console.warn(`[AntiBot] Rate limit alcanzado para IP: ${ip}`);
    return {
      success: false,
      message: "Has enviado demasiados mensajes. Intenta de nuevo en un minuto.",
    };
  }

  // ─── Validación estándar ───
  if (!name || !email || !message) {
    return { success: false, message: "Todos los campos son obligatorios." };
  }

  // Validación básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: "El correo electrónico no es válido." };
  }

  // Limitar longitud para evitar payloads abusivos
  if (name.length > 100 || email.length > 254 || message.length > 5000) {
    return { success: false, message: "Uno de los campos excede la longitud permitida." };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${escapeHtml(name)}" <${process.env.EMAIL_SERVER_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `Nuevo mensaje de contacto de ${escapeHtml(name)}`,
      text: message,
      html: `<p>Has recibido un nuevo mensaje de tu tienda:</p><p><strong>Nombre:</strong> ${escapeHtml(name)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Mensaje:</strong></p><p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`,
    });
    return { success: true, message: "¡Mensaje enviado con éxito!" };
  } catch (error) {
    console.error("Error al enviar email de contacto:", error);
    await logError({
      message: "Error al enviar email de contacto",
      stack: error instanceof Error ? error.stack : String(error),
    });
    return { success: false, message: "Error al enviar el mensaje. Inténtalo de nuevo más tarde." };
  }
}