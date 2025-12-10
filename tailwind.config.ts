import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          DEFAULT: "#0087f6",
          light: "#3ba9ff",
          dark: "#0065c7",
          foreground: "#ffffff",
        },
        growth: {
          DEFAULT: "#279b48",
          light: "#4fb366",
          dark: "#1d7a37",
          foreground: "#ffffff",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        heading: ["var(--font-lexend)"],
      },
      textWrap: {
        balance: "balance",
      },
      backgroundColor: {
        "dark-bg": "#0f172a",
        "dark-card": "#1e293b",
        "dark-hover": "#334155",
      },
      borderColor: {
        "dark-border": "#334155",
      },
      maxWidth: {
        container: "1600px",
      },
    },
    container: {
      center: true,
      screens: {
        sm: "100%",
        md: "100%",
        lg: "1024px",
        xl: "1152px",
        "2xl": "1152px",
      },
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "2rem",
        "2xl": "2rem",
      },
    },
  },
};
export default config;
