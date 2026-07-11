/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9f1',
          100: '#dcf0de',
          200: '#bbe1c0',
          300: '#8dca97',
          400: '#57ac67',
          500: '#348f47',
          600: '#237237',
          700: '#1c5b2e',
          800: '#194927',
          900: '#153c22',
        },
        earth: {
          50: '#faf7f2',
          100: '#f2ebde',
          200: '#e4d5bd',
          300: '#d2b993',
          400: '#bd9767',
          500: '#a97f4c',
          600: '#916640',
          700: '#754f36',
          800: '#614231',
          900: '#52392c',
        },
        accent: {
          50: '#fbf1ec',
          100: '#f6ddd0',
          200: '#edbaa0',
          300: '#e29874',
          400: '#e07c56',
          500: '#c65a34',
          600: '#ad4e2d',
          700: '#8c3f27',
          800: '#723523',
          900: '#5e2e20',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      minHeight: {
        tap: '44px',
      },
      minWidth: {
        tap: '44px',
      },
    },
  },
  plugins: [],
};
