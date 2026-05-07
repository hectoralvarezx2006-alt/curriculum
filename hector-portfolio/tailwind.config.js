/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          purple: '#a855f7',
          green:  '#22d3ee',
          pink:   '#ec4899',
        },
      },
      fontFamily: {
        mono: ['"Fira Code"', '"Cascadia Code"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
