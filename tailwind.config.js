/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './emails/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        violet:  { DEFAULT: '#7c3aed', light: '#ede9fe', mid: '#8b5cf6' },
        pink:    { DEFAULT: '#ec4899', light: '#fce7f3' },
        teal:    { DEFAULT: '#0d9488', light: '#ccfbf1' },
        amber:   { DEFAULT: '#f59e0b', light: '#fef3c7' },
        green:   { DEFAULT: '#10b981', light: '#d1fae5' },
      },
      backgroundImage: {
        'grad-brand': 'linear-gradient(135deg, #7c3aed, #ec4899)',
        'grad-full':  'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%)',
      },
      borderRadius: {
        DEFAULT: '10px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      animation: {
        'fade-up':  'fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':  'fade-in 0.3s ease both',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
