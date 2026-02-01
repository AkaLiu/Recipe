/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
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
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#333',
            h1: {
              color: '#a41034',
              fontFamily: 'Merriweather, serif',
            },
            h2: {
              color: '#a41034',
              fontFamily: 'Merriweather, serif',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
