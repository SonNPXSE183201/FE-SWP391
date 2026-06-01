/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background
        'bg-primary': '#0F0F14',
        'bg-secondary': '#1A1A24',
        'bg-surface': '#22222E',
        'border-custom': '#2E2E3A',

        // Accent
        'brand': '#6C5CE7',
        'brand-hover': '#7C6EF0',
        'secondary': '#00CECE',
        'success': '#00D68F',
        'warning': '#FFAA00',
        'danger': '#FF4757',
        'info': '#4DABF7',

        // Text
        'text-primary': '#F0F0F5',
        'text-secondary': '#8B8B9E',
        'text-muted': '#5A5A6E',
      },
      fontFamily: {
        'primary': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm-custom': '6px',
        'md-custom': '8px',
        'lg-custom': '12px',
        'xl-custom': '16px',
      },
      boxShadow: {
        'sm-custom': '0 2px 4px rgba(0, 0, 0, 0.2)',
        'md-custom': '0 4px 12px rgba(0, 0, 0, 0.3)',
        'lg-custom': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'brand': '0 4px 20px rgba(108, 92, 231, 0.35)',
        'brand-hover': '0 8px 30px rgba(108, 92, 231, 0.5)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -30px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
        },
        'float-card': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-particle': {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.3' },
          '90%': { opacity: '0.3' },
          '100%': { transform: 'translateY(-400px) translateX(80px)', opacity: '0' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { boxShadow: '0 0 8px #00D68F' },
          '50%': { boxShadow: '0 0 16px #00D68F, 0 0 24px rgba(0, 214, 143, 0.3)' },
        },
        'scroll-bounce': {
          '0%, 100%': { top: '8px', opacity: '1' },
          '50%': { top: '18px', opacity: '0.3' },
        },
        'scroll-x': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'float-card': 'float-card 6s ease-in-out infinite',
        'float-particle': 'float-particle 15s linear infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'scroll-bounce': 'scroll-bounce 2s ease-in-out infinite',
        'scroll-x': 'scroll-x 40s linear infinite',
      },
    },
  },
  plugins: [],
}
