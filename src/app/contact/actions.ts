"use server";

import { logError } from "@/lib/actions/error";
import nodemailer from "nodemailer";

export interface FormState {
  success: boolean;
  message: string;
}

export async function sendContactEmail(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { success: false, message: "Todos los campos son obligatorios." };
  }

  // IMPORTANTE: Usa variables de entorno para tus credenciales.
  // No las escribas directamente en el código.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: true, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_SERVER_USER}>`,
      to: process.env.EMAIL_TO, // El correo que recibirá el mensaje
      replyTo: email,
      subject: `Nuevo mensaje de contacto de ${name}`,
      text: message,
      html: `<p>Has recibido un nuevo mensaje de tu tienda:</p><p><strong>Nombre:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Mensaje:</strong></p><p>${message}</p>`,
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