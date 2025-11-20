/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          soft: '#3b82f6',
          dark: '#1e40af',
          surface: '#dbeafe',
        },
        secondary: {
          DEFAULT: '#4338ca',
          dark: '#312e81',
          soft: '#c7d2fe',
        },
        indigo: {
          25: '#eef2ff',
        },
        fuchsia: {
          25: '#fdf2f8',
        },
        teal: {
          25: '#e0f7f4',
        },
        accent: {
          DEFAULT: '#14b8a6',
          dark: '#0f766e',
          soft: '#99f6e4',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
          alt: '#eef2ff',
        },
        text: {
          DEFAULT: '#0f172a',
          soft: '#475569',
          muted: '#94a3b8',
        },
      },
      backgroundImage: {
        'hero-soft': 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(147,51,234,0.12), rgba(13,148,136,0.12))',
        'shell-light': 'linear-gradient(135deg, #eef2ff, #fdf2f8 45%, #f8fafc)',
        'card-glow': 'radial-gradient(circle at top, rgba(79,70,229,0.18), transparent 55%)',
      },
      boxShadow: {
        shell: '0 25px 65px rgba(15, 23, 42, 0.08)',
        lift: '0 18px 35px rgba(15, 23, 42, 0.1)',
        card: '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 10px 15px -5px rgba(15, 23, 42, 0.05)',
        soft: '0 12px 30px rgba(15,23,42,0.08)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
        pill: '999px',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(.2,.9,.2,1)',
      },
    },
  },
  plugins: [],
}

