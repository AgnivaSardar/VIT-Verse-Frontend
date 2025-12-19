/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vit: {
          blue: '#003366',
          'light-blue': '#00509d',
          yellow: '#ffcc00'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif']
      }
    }
  },
  plugins: [],
}
