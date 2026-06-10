/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        coffee: {
          50: '#FAF6F1',
          100: '#F5F0E8',
          200: '#E8DCCB',
          300: '#D4BFA4',
          400: '#B89770',
          500: '#9B7653',
          600: '#7D5E3F',
          700: '#6F4E37',
          800: '#5A3E2A',
          900: '#422B1C',
        },
        brass: {
          400: '#CDA752',
          500: '#B8860B',
          600: '#9A6E09',
        },
        forest: {
          500: '#2E5339',
          600: '#24432D',
        },
        parchment: '#F5F0E8',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(111, 78, 55, 0.1)',
        'card': '0 8px 30px rgba(111, 78, 55, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
