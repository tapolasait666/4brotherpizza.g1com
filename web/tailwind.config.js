/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFC800',
          gold: '#E5A900',
          charcoal: '#121316',
          dark: '#0B0C0E',
          wood: '#2E1A11',
          neon: '#FFE144',
        },
      },
      fontFamily: {
        heading: ['Oswald', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glow-yellow': '0 0 25px rgba(255, 200, 0, 0.45)',
        'glow-card': '0 10px 30px -10px rgba(0,0,0,0.7)',
        'neon-sign': '0 0 10px #FFC800, 0 0 25px rgba(255, 200, 0, 0.6)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
