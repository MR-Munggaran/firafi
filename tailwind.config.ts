import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body:    ["DM Sans", "system-ui", "sans-serif"],
      },
      colors: {
        rose: {
          50:  "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        },
        stone: {
          50:  "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        rose:     "0 4px 24px -4px rgba(244,63,94,0.14)",
        "rose-sm":"0 2px 12px rgba(244,63,94,0.20)",
        card:     "0 1px 8px 0 rgba(28,25,23,0.06)",
        "card-md":"0 4px 16px 0 rgba(28,25,23,0.08)",
      },
      animation: {
        "slide-up":    "slide-up 0.38s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in":     "fade-in 0.25s ease both",
        "nav-bounce":  "nav-bounce 0.4s cubic-bezier(0.22,1,0.36,1)",
      },
      keyframes: {
        "slide-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "nav-bounce": {
          "0%":   { transform: "translateY(0)" },
          "40%":  { transform: "translateY(-5px)" },
          "70%":  { transform: "translateY(2px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;