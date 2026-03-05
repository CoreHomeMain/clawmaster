/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a'
        },
        claw: {
          red: '#e53935',
          dark: '#1a1a2e',
          darker: '#0f0f1a'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
