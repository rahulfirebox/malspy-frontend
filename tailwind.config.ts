import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        'primary-dark': '#2563eb',
        'primary-light': 'rgba(59, 130, 246, 0.12)',
        'accent-green': '#10b981',
        'accent-amber': '#f59e0b',
        'accent-purple': '#8b5cf6',
        'rating-a': '#10b981',
        'rating-a-text': '#6ee7b7',
        'rating-b': '#eab308',
        'rating-b-text': '#fde047',
        'rating-c': '#f97316',
        'rating-c-text': '#fdba74',
        'rating-d': '#ef4444',
        'rating-d-text': '#fca5a5',
        success: '#10b981',
        'success-bg': 'rgba(16, 185, 129, 0.12)',
        danger: '#ef4444',
        'danger-bg': 'rgba(239, 68, 68, 0.12)',
        warning: '#eab308',
        'warning-bg': 'rgba(234, 179, 8, 0.12)',
        info: '#3b82f6',
        'info-bg': 'rgba(59, 130, 246, 0.12)',
        'bg-page': '#020617',
        'bg-card': '#0f172a',
        'bg-elevated': '#1e293b',
        'bg-sidebar': '#0a0f1e',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'text-sidebar': '#cbd5e1',
        border: 'rgba(255, 255, 255, 0.1)',
        'border-dark': 'rgba(255, 255, 255, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.3)',
        md: '0 4px 12px rgba(0,0,0,0.4)',
        lg: '0 10px 30px rgba(0,0,0,0.5)',
        glow: '0 0 40px rgba(59, 130, 246, 0.25)',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
    },
  },
  plugins: [],
}
export default config
