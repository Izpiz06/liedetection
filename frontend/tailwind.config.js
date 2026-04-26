/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neo: {
          bg: '#FFF8E7',
          dark: '#1a1a2e',
          'dark-card': '#252547',
          yellow: '#FFD93D',
          red: '#FF6B6B',
          blue: '#4D96FF',
          green: '#6BCB77',
          purple: '#B983FF',
          text: '#111111',
          'text-dark': '#f0f0f0',
        },
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neo': '6px 6px 0px #111111',
        'neo-sm': '3px 3px 0px #111111',
        'neo-lg': '8px 8px 0px #111111',
        'neo-hover': '2px 2px 0px #111111',
        'neo-dark': '6px 6px 0px rgba(255,255,255,0.2)',
        'neo-dark-sm': '3px 3px 0px rgba(255,255,255,0.2)',
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'score-fill': 'scoreFill 1.5s ease-out forwards',
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scoreFill: {
          '0%': { strokeDashoffset: '283' },
        },
      },
    },
  },
  plugins: [],
}
