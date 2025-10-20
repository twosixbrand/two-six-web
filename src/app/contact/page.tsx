"use client";

import Banner from "@/components/Banner";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendContactEmail, type FormState } from "./actions";

const initialState: FormState = { success: false, message: "" };

export default function ContactPage() {
  return (
    <>
      <Banner
        imageUrl="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=1200&q=80"
        title="Contacto"
        subtitle="Estamos aquí para ayudarte"
      />

      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Formulario de Contacto */}
          <div>
            <h2 className="text-2xl font-bold text-primary mb-6">Envíanos un mensaje</h2>
            <ContactForm />
          </div>

          {/* Información de Contacto */}
          <div className="bg-secondary p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-primary mb-6">
              Información Adicional
            </h2>
            <div className="space-y-4 text-primary/90">
              <p>
                <strong>Correo Electrónico:</strong>
                <a
                  href="mailto:twosixmarca@gmail.com"
                  className="block text-accent hover:underline"
                >
                  twosixmarca@gmail.com
                </a>
              </p>
              <p>
                <strong>WhatsApp:</strong>
                <a
                  href="https://wa.me/3013975582"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-accent hover:underline"
                >
                  +57 301 397 5582
                </a>
              </p>
              <p>
                <strong>Horario de Atención:</strong>
                <span className="block">
                  Lunes a Viernes: 9:00 AM - 6:00 PM
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ContactForm() {
  const [state, formAction] = useActionState(sendContactEmail, initialState);

  return (
    <form action={formAction} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-primary/90">Nombre</label>
                <input type="text" id="name" name="name" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-primary/90">Correo Electrónico</label>
                <input type="email" id="email" name="email" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-primary/90">Mensaje</label>
                <textarea id="message" name="message" rows={4} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent"></textarea>
              </div>
              <div>
        <SubmitButton />
              </div>
      {state.message && (
        <p className={`mt-4 text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-hover transition-colors duration-300 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {pending ? "Enviando..." : "Enviar Mensaje"}
    </button>
  );
}