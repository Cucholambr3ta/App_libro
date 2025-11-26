/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(260, 85%, 58%)',
          dark: 'hsl(260, 85%, 48%)',
          light: 'hsl(260, 85%, 68%)',
        },
        secondary: 'hsl(340, 82%, 52%)',
        accent: 'hsl(180, 80%, 45%)',
        dark: {
          DEFAULT: 'hsl(230, 17%, 14%)',
          secondary: 'hsl(232, 19%, 19%)',
          card: 'hsl(228, 25%, 23%)',
          'card-hover': 'hsl(228, 25%, 28%)',
        },
      },
      fontFamily: {
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
