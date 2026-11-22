/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lab: {
          bg: '#090A09',
          surface: '#111211',
          card: '#161716',
          border: '#2A2B2A',
          'border-light': '#3A3B3A',
          text: '#F5F0EB',
          muted: '#8A8A8A',
          dim: '#5A5A5A',
          accent: '#C5F36B',
          'accent-dim': '#9BC34D',
          'accent-dark': '#3D5A10',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      fontSize: {
        'hero': ['clamp(3rem, 8vw, 7.5rem)', { lineHeight: '0.92', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-lg': ['clamp(2rem, 5vw, 4.5rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'section-num': ['clamp(4rem, 10vw, 9rem)', { lineHeight: '1', letterSpacing: '-0.05em', fontWeight: '800' }],
      },
      animation: {
        'scroll-hint': 'scrollHint 2.5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'grid-pulse': 'gridPulse 8s ease-in-out infinite',
      },
      keyframes: {
        scrollHint: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0.3' },
          '50%': { transform: 'translateY(12px)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        gridPulse: {
          '0%, 100%': { opacity: '0.03' },
          '50%': { opacity: '0.06' },
        },
      },
    },
  },
  plugins: [],
}

