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
        '192': '48rem',
      },
    },
    screens: {
      'xl': '1920px',  // 1920 x 1080 screen
      'lg': '1600px',      //1600 x 900 screen
      'md': '1280px',      //1280 x 1024 screen
      // 'sm': '900px',

    }
  },
  plugins: [],
};
export default config;
