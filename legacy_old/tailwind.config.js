/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            50: '#eef3fb',
            100: '#d9e4f8',
            200: '#b3c9f1',
            500: '#1e3a6e',
            600: '#1b3463',
            700: '#152a52',
          },
          pink: {
            50: '#fdebf3',
            100: '#f9cfe0',
            200: '#f2a0c6',
            500: '#e84c88',
            600: '#d84a7e',
            700: '#c43d6d',
          },
          gold: {
            50: '#fff6db',
            100: '#ffe9a8',
            200: '#ffd66b',
            500: '#f7c948',
            600: '#e2b740',
            700: '#caa236',
          },
        },
      },
    },
  },
  plugins: [],
}
