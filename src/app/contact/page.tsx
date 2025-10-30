"use client";

import { useActionState } from "react";
import { sendContactEmail, type FormState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import Banner from "@/components/Banner";

const initialState: FormState = {
  success: false,
  message: "",
};

export default function ContactPage() {  
  return (
    <>
      <Banner
        imageUrl="https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=1200&q=80"
        title="Contacto"
        subtitle="Estamos aquí para ayudarte. ¡Hablemos!"
      />
      <ContactForm />
    </>
  );
}

function ContactForm() {
  const [state, formAction] = useActionState(sendContactEmail, initialState);

  return (
    <section className="container mx-auto px-6 py-16 md:py-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16">
        {/* Columna de Información */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">Ponte en contacto</h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            ¿Tienes alguna pregunta sobre nuestros productos, tu pedido o simplemente quieres saludarnos? Completa el formulario y nuestro equipo se pondrá en contacto contigo lo antes posible.
          </p>
          <div className="mt-8 space-y-4 text-gray-700">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-accent mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span>Medellín, Colombia</span>
            </div>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-accent mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              <a href="mailto:info@twosixbrand.com" className="hover:text-accent">info@twosixbrand.com</a>
            </div>
          </div>
        </div>

        {/* Columna del Formulario */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary">
                Nombre Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-primary">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-accent focus:border-accent"
              ></textarea>
            </div>
            <div>
              <SubmitButton text="Enviar Mensaje" pendingText="Enviando..." />
            </div>
            {state.message && (
              <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
                {state.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
