/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        coffee: {
          50:  '#fdf6f0',
          100: '#f9e8d4',
          200: '#f2c99a',
          300: '#e8a465',
          400: '#d4813a',
          500: '#b5601f',
          600: '#8c4516',
          700: '#6b3210',
          800: '#4a2209',
          900: '#2d1505',
        },
        cream: {
          50:  '#fefefe',
          100: '#fdf9f3',
          200: '#f8efdf',
          300: '#f0dfc0',
          400: '#e5c896',
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    }
  },
  plugins: []
}
