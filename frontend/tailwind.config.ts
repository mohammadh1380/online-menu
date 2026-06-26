import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
      colors: {
        coffee: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f3d9a8',
          300: '#e8bb6e',
          400: '#dc9a3a',
          500: '#c87f22',
          600: '#a8641a',
          700: '#884d18',
          800: '#6e3e1a',
          900: '#5a3318',
        },
      },
    },
  },
  plugins: [],
};

export default config;
