/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#F5F8F6',
          surface: '#FFFFFF',
          ink: '#14201C',
          muted: '#5B6B65',
          line: '#DCE5E0',
          green: '#0F6E56',
          'green-hover': '#0C5845',
          teal: '#1D9E75',
          mint: '#E3F3EC',
          star: '#E0A028',
          error: '#A32D2D',
          dark: {
            bg: '#0F1613',
            surface: '#17211D',
            ink: '#E8F0EC',
            muted: '#9BADA5',
            line: '#2A3833',
            green: '#5DCAA5',
            mint: '#1B2E27',
            error: '#F09595',
          }
        },
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}

