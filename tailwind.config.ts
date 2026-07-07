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
        primary: '#2563EB',
        'primary-dark': '#1D4ED8',
        'primary-light': 'rgba(37, 99, 235, 0.12)',
        accent: {
          green: '#10B981',
          orange: '#F59E0B',
          purple: '#8B5CF6',
        },
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
        'bg-page': '#050816',
        'bg-card': '#0F172A',
        'bg-elevated': '#111827',
        'bg-sidebar': '#070B14',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-sidebar': '#CBD5E1',
        border: '#1E293B',
        'border-dark': '#334155',
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
        md: '0 4px 12px rgba(0,0,0,0.35)',
        lg: '0 10px 30px rgba(0,0,0,0.45)',
        glow: '0 0 40px rgba(37, 99, 235, 0.35)',
      },
    },
  },
  plugins: [],
}
export default config
