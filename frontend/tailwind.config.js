/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'gradient-bg': 'gradientBG 15s ease infinite',
        'pulse-slow': 'pulse 2s infinite',
      },
    },
  },
  plugins: [],
}

