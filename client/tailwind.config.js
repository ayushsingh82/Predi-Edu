/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          light: '#FFF1F5',
          950: '#FFF1F5',  // Light pink background
          900: '#FFE4ED',  // Slightly darker pink for cards
          800: '#FFD6E5',  // For borders
          600: '#FF4D94',  // For buttons
          500: '#FF3385',  // For button hovers
          400: '#FF1A75',  // For highlights
          300: '#FFB3D1',  // For text
          200: '#FFC2D9',  // For labels
        }
      }
    },
  },
  plugins: [],
} 