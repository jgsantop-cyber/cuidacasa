/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-blue': '#0B101D',
        'slate-card': '#162032',
        'neon-blue': '#00D4FF',
        'metallic-blue': '#2563EB',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
      },
      fontSize: {
        'base-mobile': '1rem',
        'lg-mobile': '1.125rem',
        'xl-mobile': '1.25rem',
      }
    },
  },
  plugins: [],
}