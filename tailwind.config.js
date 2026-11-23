/** @type {import('tailwindcss').Config} */
const v = (n) => `rgb(var(--c-${n}) / <alpha-value>)`;
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: v("paper"), ink: v("ink"), plum: v("plum"),
        blush: v("blush"), peach: v("peach"), butter: v("butter"), mint: v("mint"), sky: v("sky"), lilac: v("lilac"),
        stone: { 150: v("stone") },
        clay: { DEFAULT: "#B4532A", dark: "#8F3F1E", soft: "#F3E3DA" },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["Iowan Old Style", "Palatino Linotype", "Palatino", "Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};
