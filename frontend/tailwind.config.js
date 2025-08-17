/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'ripple': 'ripple 1s ease-out',
        'color-cycle': 'color-cycle 3s ease-in-out infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'color-cycle': {
          '0%, 100%': { color: '#10b981' },
          '33%': { color: '#3b82f6' },
          '66%': { color: '#8b5cf6' },
        }
      }
    },
  },
  plugins: [],
}
