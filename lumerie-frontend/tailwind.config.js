/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-1": "var(--surface-1)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        ink: "var(--on-surface)",
        "ink-muted": "var(--on-surface-variant)",
        outline: "var(--outline)",
        "outline-soft": "var(--outline-variant)",
        gold: "var(--gold)",
        "gold-deep": "var(--gold-deep)",
        error: "var(--error)",
      },
      fontFamily: {
        display: ["'Libre Caslon Text'", "serif"],
        body: ["Manrope", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.2em",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};
