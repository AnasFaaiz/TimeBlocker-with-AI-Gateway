import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      spacing: {
        '104': '26rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      borderWidth: {
        '3': '3px',
        '6': '6px',
      },
      blur: {
        '3xl': '64px',
      },
      boxShadow: {
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
      },
      ringWidth: {
        '6': '6px',
      },
      // Add missing backdrop-blur extension
      backdropBlur: {
        '3xl': '64px',
      }
    },
  },
  plugins: [],
}

export default config