import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: {
          DEFAULT: "#0a1f44",
          light: "#13315c",
          dark: "#061534",
        },
        gold: {
          DEFAULT: "#c9a227",
          light: "#d8b94a",
          dark: "#a8851a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
