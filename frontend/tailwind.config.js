/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E6F4F5',
          100: '#C0E3E6',
          200: '#8ECBD0',
          300: '#57B2BA',
          400: '#2B9FAA',
          500: '#0D8C99',
          600: '#0A7A86',
          700: '#08636E',
          800: '#064D56',
          900: '#043840',
          950: '#021E22',
          DEFAULT: '#0A7A86',
        },
        brand: {
          DEFAULT: '#FF6B35',
          light:   '#FF8C5A',
          dark:    '#E5581E',
          50:      '#FFF2ED',
        },
        surface: '#F6F7F9',
        card:    '#FFFFFF',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        card: '10px',
      },
      boxShadow: {
        card:    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10)',
        nav:     '0 1px 0 rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-in-out',
        'slide-up':  'slideUp 0.3s ease-out',
        'slide-down':'slideDown 0.3s ease-out',
        'scale-in':  'scaleIn 0.2s ease-out',
        shimmer:     'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                                         to: { opacity: '1' } },
        slideUp:   { from: { transform: 'translateY(16px)', opacity: '0' },          to: { transform: 'translateY(0)',  opacity: '1' } },
        slideDown: { from: { transform: 'translateY(-16px)', opacity: '0' },         to: { transform: 'translateY(0)',  opacity: '1' } },
        scaleIn:   { from: { transform: 'scale(0.96)', opacity: '0' },               to: { transform: 'scale(1)',       opacity: '1' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      backgroundImage: {
        shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
