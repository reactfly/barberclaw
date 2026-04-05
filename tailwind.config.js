/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Saira Extra Condensed"', 'sans-serif'],
        display: ['"Tulpen One"', 'cursive'],
        economica: ['"Economica"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}