import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--analytics-primary, #3b82f6)',
      },
      fontFamily: {
        sans: ['var(--analytics-font-family, "Inter")', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
