import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      spacing: {
        '112': '28rem',
        '116': '29rem', // Adding custom spacing for 28rem
      },
    },
    screens: {
      'xl': '1920px',
      'lg': '1600px',
      'md': '1280px',
      // 'sm': '900px',

    }
  },
  plugins: [],
};
export default config;
