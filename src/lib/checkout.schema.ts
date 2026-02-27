import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(7, "Teléfono inválido"),
  address: z.string().min(5, "La dirección es obligatoria"),
  detail: z.string().optional(),
  instructions: z.string().optional(),
  department: z.string().min(1, "El departamento es obligatorio"),
  city: z.string().min(1, "La ciudad es obligatoria"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
