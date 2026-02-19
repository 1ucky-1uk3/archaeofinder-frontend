/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'archaeo': {
          'dark': '#1a1612',
          'brown': '#2d2520',
          'gold': '#c9a962',
          'gold-dark': '#a08050',
          'cream': '#e8e0d5',
          'muted': '#a09080',
        }
      },
      fontFamily: {
        'serif': ['Cormorant Garamond', 'Georgia', 'serif'],
        'sans': ['Source Sans 3', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
