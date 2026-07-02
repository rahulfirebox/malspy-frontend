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
        primary: '#2B7DBC',
        'primary-dark': '#1A5E8F',
        'primary-light': '#EBF4FD',
        'rating-a': '#22c55e',
        'rating-a-text': '#166534',
        'rating-b': '#eab308',
        'rating-b-text': '#713f12',
        'rating-c': '#f97316',
        'rating-c-text': '#7c2d12',
        'rating-d': '#ef4444',
        'rating-d-text': '#7f1d1d',
        success: '#22c55e',
        'success-bg': '#f0fdf4',
        danger: '#ef4444',
        'danger-bg': '#fef2f2',
        warning: '#eab308',
        'warning-bg': '#fefce8',
        info: '#3b82f6',
        'info-bg': '#eff6ff',
        'bg-page': '#f4f6f8',
        'bg-card': '#ffffff',
        'bg-sidebar': '#1e2533',
        'text-primary': '#1f2937',
        'text-secondary': '#6b7280',
        'text-sidebar': '#d1d5db',
        border: '#e5e7eb',
        'border-dark': '#d1d5db',
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
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        md: '0 4px 6px rgba(0,0,0,0.07)',
        lg: '0 10px 25px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
export default config
