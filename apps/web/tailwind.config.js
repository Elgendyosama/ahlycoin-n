/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        'surface-hover': '#f1f5f9',
        card: '#ffffff',
        primary: {
          DEFAULT: '#e11d48',
          hover: '#dc2626',
        },
        sports: {
          green: '#10b981',
          red: '#e11d48',
          gold: '#f59e0b',
          neon: '#10b981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'float-up': 'floatUp 2.5s ease-out forwards',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-180px) scale(1.4)' },
        },
      },
    },
  },
  plugins: [],
};
