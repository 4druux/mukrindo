// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Untuk Pages Router
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Komponen Anda
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Untuk App Router (jika Anda menggunakannya)
  ],
  theme: {
    extend: {},
  },
  // Menambahkan plugin
  plugins: [require("@tailwindcss/forms")],
};
