/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f2f5f3',
          100: '#dce6e0',
          200: '#b6ccc0',
          300: '#8aad9d',
          400: '#628e7c',
          500: '#3f6b59',
          600: '#2F4A3E',
          700: '#243b31',
          800: '#1a2d25',
          900: '#111e19',
        },
        terra:  { DEFAULT: '#C17A54', dark: '#B85C38' },
        cream:  { DEFAULT: '#FAF6EF', dark: '#F0EAE0', border: '#DDD4C4' },
        ink:    { DEFAULT: '#2A2420', muted: '#6B5F58', faint: '#A89E97' },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans:  ['Be Vietnam Pro', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
