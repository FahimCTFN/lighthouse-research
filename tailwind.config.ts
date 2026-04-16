import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        serif: ["Georgia", "'Times New Roman'", "serif"],
      },
      colors: {
        // Warm paper canvas — easier on the eyes than pure white for long reads.
        paper: "#faf8f2",
        "paper-soft": "#f3f0e8",
        // Softer ink tones so body prose is not full-contrast black.
        ink: "#1f2937",
        "ink-muted": "#4a5568",
        brand: {
          navy: "#0c2d48",
          "navy-dark": "#071d30",
          gold: "#d4860a",
          "gold-light": "#fdf0d5",
          "gold-ink": "#7a4a00",
        },
      },
      letterSpacing: {
        label: "0.08em",
      },
      animation: {
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
