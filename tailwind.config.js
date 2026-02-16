/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#000000", // Tu nuevo color oscuro para texto principal
        secondary: "#f7f5f0", // Un blanco cálido para fondos, complementa los dorados
        accent: {
          DEFAULT: "#c09549", // Tu dorado más oscuro para botones y enlaces
          hover: "#a98240", // Un tono ligeramente más oscuro para el efecto hover
        },
        highlight: {
          DEFAULT: "#e6ca7e", // Tu dorado más claro para detalles y destacados
          text: "#313835", // Color de texto para usar sobre este fondo
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};