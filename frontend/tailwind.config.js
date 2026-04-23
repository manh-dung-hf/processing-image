/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--canvas)',
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
          sunken: 'var(--surface-sunken)',
        },
        fg: {
          primary: 'var(--fg-primary)',
          secondary: 'var(--fg-secondary)',
          tertiary: 'var(--fg-tertiary)',
          disabled: 'var(--fg-disabled)',
        },
        border: {
          DEFAULT: 'var(--border)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          soft: 'var(--accent-soft)',
          'soft-fg': 'var(--accent-soft-fg)',
        },
        success: {
          DEFAULT: 'var(--success)',
          soft: 'var(--success-soft)',
          'soft-fg': 'var(--success-soft-fg)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          soft: 'var(--warning-soft)',
          'soft-fg': 'var(--warning-soft-fg)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          soft: 'var(--danger-soft)',
          'soft-fg': 'var(--danger-soft-fg)',
        },
        info: {
          DEFAULT: 'var(--info)',
          soft: 'var(--info-soft)',
          'soft-fg': 'var(--info-soft-fg)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Text', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'monospace'],
      },
      fontSize: {
        display: ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '500' }],
        h1:      ['24px', { lineHeight: '32px', letterSpacing: '-0.015em', fontWeight: '500' }],
        h2:      ['18px', { lineHeight: '26px', letterSpacing: '-0.01em', fontWeight: '500' }],
        h3:      ['15px', { lineHeight: '22px', letterSpacing: '-0.005em', fontWeight: '500' }],
        body:    ['14px', { lineHeight: '22px' }],
        small:   ['13px', { lineHeight: '20px' }],
        caption: ['11px', { lineHeight: '16px', letterSpacing: '0.04em', fontWeight: '500' }],
        mono:    ['12px', { lineHeight: '18px' }],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
      },
      boxShadow: {
        'e-0': 'none',
        'e-1': 'var(--elevation-1)',
        'e-2': 'var(--elevation-2)',
        'e-3': 'var(--elevation-3)',
      },
      transitionDuration: {
        instant: '80ms',
        fast:    '160ms',
        base:    '240ms',
        slow:    '400ms',
        reveal:  '700ms',
      },
      transitionTimingFunction: {
        out:    'cubic-bezier(0.2, 0.8, 0.2, 1)',
        spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
