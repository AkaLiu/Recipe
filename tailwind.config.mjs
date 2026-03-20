/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // New editorial palette
        wine: {
          50: '#fdf2f4',
          100: '#fce4e8',
          200: '#facdd5',
          300: '#f5a3b3',
          400: '#ed6d88',
          500: '#d94466',
          600: '#b82e50',
          700: '#9c2541',
          800: '#7c2d35',
          900: '#6b1d30',
          950: '#3d0d19',
        },
        copper: {
          50: '#fdf8f1',
          100: '#f9eddb',
          200: '#f2d8b6',
          300: '#eabd87',
          400: '#e09c57',
          500: '#d68538',
          600: '#b87333',
          700: '#9a5c28',
          800: '#7d4a27',
          900: '#672e22',
          950: '#381910',
        },
        linen: {
          50: '#faf8f5',
          100: '#f5f1eb',
          200: '#ede7dc',
          300: '#e0d5c5',
          400: '#cdbfa7',
        },
        brown: {
          50: '#faf7f5',
          100: '#f0e9e3',
          200: '#dfd3c8',
          300: '#c9b5a3',
          400: '#b0947c',
          500: '#9e7c64',
          600: '#8b6750',
          700: '#755545',
          800: '#3d2c2c',
          900: '#2c1e1e',
        },
        'warm-gray': {
          50: '#faf9f7',
          100: '#f0eeeb',
          200: '#e2dfd9',
          300: '#cdc8bf',
          400: '#b1a99d',
          500: '#9a907f',
          600: '#847a6b',
          700: '#6b6258',
          800: '#59524a',
          900: '#4a453e',
        },
        // Keep old palettes for print style compatibility
        terracotta: {
          50: '#fef5f2',
          100: '#fdeae4',
          200: '#fad0c6',
          300: '#f6ab9b',
          400: '#f07c66',
          500: '#ea5639',
          600: '#d94324',
          700: '#c0351e',
          800: '#a41034',
          900: '#861229',
        },
        cream: {
          50: '#faf9f6',
          100: '#f5f3ef',
          200: '#e8e4dc',
        },
        sage: {
          50: '#f4f7f4',
          100: '#e3ebe3',
          200: '#c5d6c5',
          300: '#9eb99e',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif SC', 'Cormorant Garamond', 'Georgia', 'serif'],
        display: ['Cormorant Garamond', 'Noto Serif SC', 'Georgia', 'serif'],
        condensed: ['Barlow Condensed', 'Noto Sans SC', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#3d2c2c',
            lineHeight: '1.75',
            h1: {
              color: '#9c2541',
              fontFamily: 'Cormorant Garamond, Noto Serif SC, Georgia, serif',
              fontWeight: '700',
              letterSpacing: '-0.02em',
            },
            h2: {
              color: '#9c2541',
              fontFamily: 'Cormorant Garamond, Noto Serif SC, Georgia, serif',
              fontWeight: '700',
              letterSpacing: '-0.01em',
              borderBottom: '1px solid #facdd5',
              paddingBottom: '0.4em',
            },
            h3: {
              color: '#7c2d35',
              fontFamily: 'Cormorant Garamond, Noto Serif SC, Georgia, serif',
              fontWeight: '600',
            },
            a: {
              color: '#b82e50',
              textDecoration: 'underline',
              textDecorationColor: '#facdd5',
              textUnderlineOffset: '3px',
              '&:hover': {
                color: '#9c2541',
                textDecorationColor: '#9c2541',
              },
            },
            strong: {
              color: '#3d2c2c',
              fontWeight: '600',
            },
            table: {
              borderCollapse: 'collapse',
            },
            'thead th': {
              color: '#7c2d35',
              borderBottomColor: '#7c2d35',
              fontWeight: '600',
              fontFamily: 'Cormorant Garamond, Noto Serif SC, Georgia, serif',
              fontSize: '0.875em',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            },
            'tbody td': {
              borderBottomColor: '#ede7dc',
              padding: '0.75em 1em',
            },
            'tbody tr': {
              borderBottomColor: '#ede7dc',
            },
          },
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in-delay-1': 'fade-in 0.6s ease-out 0.15s forwards',
        'fade-in-delay-2': 'fade-in 0.6s ease-out 0.3s forwards',
        'fade-in-delay-3': 'fade-in 0.6s ease-out 0.45s forwards',
        'slide-in-right': 'slide-in-right 0.5s ease-out forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
