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
        // Extended color palette (50-950 spectrum)
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
        zinc: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "Arial", "Segoe UI", "system-ui", "-apple-system", "Helvetica", "sans-serif"],
        heading: ["'Inter'", "Arial", "Segoe UI", "system-ui", "-apple-system", "Helvetica", "sans-serif"],
      },
      spacing: {
        "x2": "0.5rem",  // 8px - for tight spacing
        "x3": "0.75rem", // 12px - for medium spacing
        "x4": "1rem",    // 16px - for standard spacing
        "x6": "1.5rem",  // 24px - for larger spacing
        "x8": "2rem",    // 32px - for section spacing
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
