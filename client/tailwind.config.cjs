/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,css}',
  ],
  safelist: [
    // Ensure brand color utilities are generated for dynamic use
    'bg-brand-red', 'text-brand-red', 'border-brand-red',
    'bg-brand-red-dark', 'text-brand-red-dark',
    'bg-brand-red-light', 'text-brand-red-light',
    'bg-brand-black', 'text-brand-black',
    'bg-brand-white', 'text-brand-white',
    'bg-brand-gray', 'text-brand-gray', 'border-brand-gray',
    'bg-brand-gray-dark', 'text-brand-gray-dark',
    'bg-brand-gray-medium', 'text-brand-gray-medium',
    'hover:bg-brand-red', 'hover:bg-brand-red-dark',
    'hover:text-brand-red', 'hover:text-brand-black',
    'focus:ring-brand-red',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#9B1B30',
          'red-dark': '#7A1526',
          'red-light': '#C4203D',
          black: '#1A1A1A',
          white: '#FFFFFF',
          gray: '#F5F5F5',
          'gray-medium': '#9CA3AF',
          'gray-dark': '#4B5563',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
