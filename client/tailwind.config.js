/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "#0A0E1A",
        surface: {
          DEFAULT: "#10162A",
          raised: "#161D33",
          hover: "#1B2440",
        },
        border: {
          DEFAULT: "#212A46",
          subtle: "#1A2138",
        },
        ink: {
          DEFAULT: "#F2F4FA",
          muted: "#96A0BE",
          faint: "#5C6584",
        },
        accent: {
          blue: "#4C7CFF",
          violet: "#8B5CF6",
          cyan: "#38DDD6",
        },
        state: {
          success: "#34D399",
          warning: "#FBBF24",
          danger: "#F87171",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #4C7CFF 0%, #8B5CF6 100%)",
        "accent-gradient-soft": "linear-gradient(135deg, rgba(76,124,255,0.16) 0%, rgba(139,92,246,0.16) 100%)",
        "canvas-glow": "radial-gradient(60% 50% at 50% 0%, rgba(76,124,255,0.14) 0%, rgba(10,14,26,0) 70%)",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5)",
        glow: "0 0 0 1px rgba(139,92,246,0.25), 0 8px 30px -8px rgba(76,124,255,0.35)",
      },
      keyframes: {
        "flow-pulse": {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
        "node-glow": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "flow-pulse": "flow-pulse 1.2s linear infinite",
        "node-glow": "node-glow 2.4s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
