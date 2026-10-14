import type { Config } from 'tailwindcss';

/** Цвет из CSS-переменной в формате RGB-каналов — поддерживает модификаторы прозрачности (`bg-bg-surface/60`). */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': token('bg-base'),
        'bg-surface': token('bg-surface'),
        'bg-elevated': token('bg-elevated'),
        border: token('border'),
        'text-primary': token('text-primary'),
        'text-secondary': token('text-secondary'),
        'text-muted': token('text-muted'),
        'accent-primary': token('accent-primary'),
        'accent-secondary': token('accent-secondary'),
        'accent-glow': token('accent-glow'),
        success: token('success'),
        danger: token('danger'),
        warning: token('warning'),
      },
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans Thai',
          'Noto Sans SC',
          'Noto Sans JP',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        display: [
          'Sora',
          'Inter',
          'Noto Sans Thai',
          'Noto Sans SC',
          'Noto Sans JP',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        display: ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        h1: ['clamp(2rem, 3.5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        h2: ['clamp(1.5rem, 2.5vw, 2.25rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        h3: ['1.5rem', { lineHeight: '1.3' }],
        body: ['1rem', { lineHeight: '1.6' }],
        small: ['0.875rem', { lineHeight: '1.5' }],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        glow: '0 0 60px -15px rgb(var(--accent-primary) / 0.45)',
        'glow-cyan': '0 0 60px -15px rgb(var(--accent-secondary) / 0.45)',
      },
      backgroundImage: {
        'grid-pattern':
          "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0H0V40' fill='none' stroke='%23ffffff' stroke-width='1' stroke-opacity='0.06'/%3E%3C/svg%3E\")",
        'dot-grid':
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'glow-indigo':
          'radial-gradient(ellipse at center, rgb(var(--accent-primary) / 0.3) 0%, transparent 70%)',
        'glow-cyan':
          'radial-gradient(ellipse at center, rgb(var(--accent-secondary) / 0.35) 0%, transparent 70%)',
        'glow-corner':
          'radial-gradient(circle at 30% 0%, rgb(var(--accent-primary) / 0.25) 0%, transparent 60%)',
        'hero-mesh': [
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgb(var(--accent-primary) / 0.12) 0%, transparent 60%)',
          'radial-gradient(ellipse 60% 40% at 80% 80%, rgb(var(--accent-secondary) / 0.08) 0%, transparent 50%)',
          'radial-gradient(ellipse 50% 60% at 10% 70%, rgb(var(--accent-glow) / 0.07) 0%, transparent 50%)',
        ].join(', '),
        'edge-glow':
          'linear-gradient(90deg, transparent 0%, rgb(var(--accent-primary) / 0.4) 30%, rgb(var(--accent-secondary) / 0.4) 70%, transparent 100%)',
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        vignette:
          'radial-gradient(ellipse 120% 90% at 50% 40%, transparent 60%, rgb(var(--bg-base) / 0.55) 100%)',
        'brand-gradient':
          'linear-gradient(135deg, rgb(var(--accent-primary)) 0%, rgb(var(--accent-glow)) 50%, rgb(var(--accent-secondary)) 100%)',
      },
      keyframes: {
        'flow-x': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'flow-y': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        orbit: {
          from: { offsetDistance: '0%' },
          to: { offsetDistance: '100%' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(0.98)', opacity: '0.85' },
          '50%': { transform: 'scale(1.03)', opacity: '1' },
        },
        'glow-breathe': {
          '0%, 100%': { transform: 'scale(0.95)', opacity: '0.2' },
          '50%': { transform: 'scale(1.05)', opacity: '0.38' },
        },
        shimmer: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(100%)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'micro-wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-10deg)' },
          '75%': { transform: 'rotate(10deg)' },
        },
        'micro-nudge': {
          '0%, 100%': { transform: 'translateX(0)' },
          '45%': { transform: 'translateX(4px)' },
          '50%': { transform: 'translateX(-4px)', opacity: '0' },
          '55%': { opacity: '1' },
        },
        'micro-pop': {
          '0%, 100%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.18)' },
        },
        'micro-lift': {
          '0%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-3px)' },
        },
        'micro-takeoff': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '45%': { transform: 'translate(6px, -6px)', opacity: '0' },
          '50%': { transform: 'translate(-6px, 6px)', opacity: '0' },
          '60%': { opacity: '1' },
        },
        'micro-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '20%': { transform: 'scale(1.15)' },
          '40%': { transform: 'scale(0.95)' },
          '60%': { transform: 'scale(1.1)' },
        },
        'glitch-a': {
          '0%, 14%, 100%': {
            transform: 'translate(0, 0)',
            clipPath: 'inset(0 0 0 0)',
            opacity: '0',
          },
          '2%': {
            transform: 'translate(-4px, 1px)',
            clipPath: 'inset(10% 0 62% 0)',
            opacity: '0.85',
          },
          '5%': {
            transform: 'translate(3px, -1px)',
            clipPath: 'inset(55% 0 20% 0)',
            opacity: '0.85',
          },
          '8%': {
            transform: 'translate(-2px, 0)',
            clipPath: 'inset(30% 0 45% 0)',
            opacity: '0.85',
          },
          '11%': {
            transform: 'translate(4px, 1px)',
            clipPath: 'inset(75% 0 5% 0)',
            opacity: '0.85',
          },
        },
        'glitch-b': {
          '0%, 14%, 100%': {
            transform: 'translate(0, 0)',
            clipPath: 'inset(0 0 0 0)',
            opacity: '0',
          },
          '3%': {
            transform: 'translate(4px, -1px)',
            clipPath: 'inset(60% 0 15% 0)',
            opacity: '0.85',
          },
          '6%': {
            transform: 'translate(-3px, 1px)',
            clipPath: 'inset(5% 0 70% 0)',
            opacity: '0.85',
          },
          '9%': { transform: 'translate(2px, 0)', clipPath: 'inset(40% 0 35% 0)', opacity: '0.85' },
          '12%': {
            transform: 'translate(-4px, -1px)',
            clipPath: 'inset(20% 0 60% 0)',
            opacity: '0.85',
          },
        },
        'scan-y': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '45%': { transform: 'translateY(700%)', opacity: '1' },
          '50%, 100%': { transform: 'translateY(700%)', opacity: '0' },
        },
        dash: {
          to: { strokeDashoffset: '-24' },
        },
        'fill-bar': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        'chip-sweep': {
          '0%, 70%, 100%': { backgroundPosition: '200% 0' },
          '35%': { backgroundPosition: '-100% 0' },
        },
        scan: {
          '0%': { transform: 'translateX(-120%)' },
          '18%, 100%': { transform: 'translateX(220%)' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { opacity: '0.3', transform: 'translateY(0)' },
          '30%': { opacity: '1', transform: 'translateY(-2px)' },
        },
      },
      animation: {
        'flow-x': 'flow-x 2.4s ease-in-out infinite',
        'flow-y': 'flow-y 2.4s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        'typing-dot': 'typing-dot 1.2s ease-in-out infinite',
        orbit: 'orbit var(--orbit-duration, 12s) linear infinite',
        breathe: 'breathe 6s ease-in-out infinite',
        'glow-breathe': 'glow-breathe 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'spin-slower': 'spin 24s linear infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'gradient-pan': 'gradient-pan 8s ease-in-out infinite',
        'micro-wiggle': 'micro-wiggle 500ms ease-in-out',
        'micro-nudge': 'micro-nudge 600ms ease-in-out',
        'micro-pop': 'micro-pop 400ms ease-out',
        'micro-lift': 'micro-lift 450ms ease-out',
        'micro-takeoff': 'micro-takeoff 700ms ease-in-out',
        'micro-pulse': 'micro-pulse 700ms ease-in-out',
        'micro-spin': 'spin 700ms cubic-bezier(0.22, 1, 0.36, 1)',
        scan: 'scan 6s ease-in-out infinite',
        'fill-bar': 'fill-bar linear forwards',
        dash: 'dash 1.2s linear infinite',
        'scan-y': 'scan-y 6s ease-in-out infinite',
        'glitch-a': 'glitch-a 6s steps(1) infinite',
        'glitch-b': 'glitch-b 6s steps(1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
