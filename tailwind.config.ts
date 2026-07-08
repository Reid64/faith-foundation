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
        cream: {
          DEFAULT: "#FAF8F1",
          dark: "#F2EEE2",
        },
        charcoal: "#22262E",
        navy: {
          DEFAULT: "#16243F",
          light: "#26395E",
          dark: "#0E1B30",
          deep: "#0A1322",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#E2C45C",
          dark: "#9C7C1F",
        },
        // Brand green — the exact dominant green sampled from the FAITH
        // Foundation logo (leaf / "FOUNDATION" wordmark).
        green: {
          DEFAULT: "#255527",
          light: "#4A8C53",
          dark: "#1C4220",
          deep: "#143017",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        serif: ["var(--font-display)", "Georgia", "serif"],
      },
      maxWidth: {
        "8xl": "88rem",
      },
      letterSpacing: {
        "tightish": "-0.015em",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(100deg, #9C7C1F 0%, #C9A227 38%, #E2C45C 60%, #C9A227 100%)",
        "green-gradient":
          "linear-gradient(100deg, #143017 0%, #1C4220 35%, #255527 60%, #4A8C53 100%)",
        "navy-radial":
          "radial-gradient(120% 120% at 80% 0%, #26395E 0%, #16243F 45%, #0A1322 100%)",
      },
      boxShadow: {
        card: "0 10px 40px -12px rgba(14, 27, 48, 0.22)",
        "card-lg": "0 30px 70px -22px rgba(14, 27, 48, 0.38)",
        gold: "0 14px 40px -14px rgba(201, 162, 39, 0.55)",
        green: "0 14px 40px -14px rgba(37, 85, 39, 0.5)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slow-zoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slow-zoom": "slow-zoom 18s ease-out forwards",
        "float-slow": "float-slow 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
