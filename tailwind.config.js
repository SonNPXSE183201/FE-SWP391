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
        'text-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
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
        'fade-in-down': {
          from: { opacity: '0', transform: 'translateY(-24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-60px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(60px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'blur-in': {
          from: { opacity: '0', filter: 'blur(12px)', transform: 'translateY(12px)' },
          to: { opacity: '1', filter: 'blur(0px)', transform: 'translateY(0)' },
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
        'gradient-shimmer': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'glow-line': {
          '0%, 100%': { opacity: '0.4', transform: 'scaleX(0.6)' },
          '50%': { opacity: '1', transform: 'scaleX(1)' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'counter-scroll': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'text-reveal': {
          from: { opacity: '0', transform: 'translateY(100%)', filter: 'blur(4px)' },
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0px)' },
        },
        'draw-line': {
          from: { strokeDashoffset: '100%' },
          to: { strokeDashoffset: '0%' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(108, 92, 231, 0.15), 0 0 60px rgba(108, 92, 231, 0.05)' },
          '50%': { boxShadow: '0 0 30px rgba(108, 92, 231, 0.3), 0 0 80px rgba(108, 92, 231, 0.1)' },
        },
        'shimmer-border': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'drift-up': {
          '0%': { transform: 'translateY(100vh) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(-20vh) rotate(720deg)', opacity: '0' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(40px) scale(0.96)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'hero-text-reveal': {
          from: { opacity: '0', transform: 'translateY(30px)', filter: 'blur(8px)' },
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0px)' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg) translateX(150px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(150px) rotate(-360deg)' },
        },
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'float-card': 'float-card 6s ease-in-out infinite',
        'float-particle': 'float-particle 15s linear infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out both',
        'fade-in-down': 'fade-in-down 0.6s ease-out both',
        'slide-in-left': 'slide-in-left 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scale-in 0.5s ease-out both',
        'blur-in': 'blur-in 0.8s ease-out both',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'scroll-bounce': 'scroll-bounce 2s ease-in-out infinite',
        'scroll-x': 'scroll-x 40s linear infinite',
        'gradient-shimmer': 'gradient-shimmer 6s ease-in-out infinite',
        'glow-line': 'glow-line 3s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 30s linear infinite',
        'counter-scroll': 'counter-scroll 40s linear infinite',
        'text-reveal': 'text-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite',
        'shimmer-border': 'shimmer-border 3s linear infinite',
        'drift-up': 'drift-up 20s linear infinite',
        'shake': 'shake 0.5s ease-in-out',
        'slide-in-up': 'slide-in-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'hero-text-reveal': 'hero-text-reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        'orbit': 'orbit 25s linear infinite',
        'text-float': 'text-float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
