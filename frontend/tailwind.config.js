/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F1A2B",      // deep navy - primary text / dark surfaces
        slate: {
          950: "#0B1420",
        },
        teal: {
          500: "#14B8A6",
          600: "#0D9488",
        },
        canvas: "#F4F6F8",   // light background
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 26, 43, 0.06), 0 1px 3px rgba(15, 26, 43, 0.08)",
      },
    },
  },
  plugins: [],
};
