import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // "Interview studio" palette — evokes a quiet recording room, not a generic SaaS theme
        studio: {
          bg: '#0F1626',       // deep navy — the "room"
          panel: '#1B2436',    // card / panel surface
          panelLight: '#242F45',
          border: '#2C3856',
          text: '#F1EEE6',     // warm off-white
          muted: '#9AA5BD',
          accent: '#E8A33D',   // amber "on-air" light — the signature color
          accentDim: '#8A6425',
          success: '#4C9A6A',
          danger: '#C4573B',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(232, 163, 61, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
