import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        evergreen: "#0A1210",
        pine: "#0E1A16",
        moss: "#1A2F28",
        fern: "#2A4A3C",
        ivory: "#F6F3EC",
        fog: "#8FA59A",
        brass: "#D4B06A",
        brassdim: "#A8883C",
        surface: "rgba(16, 31, 26, 0.72)",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        widest2: "0.22em",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(0, 0, 0, 0.45)",
        lift: "0 20px 50px -20px rgba(0, 0, 0, 0.55)",
        glow: "0 0 0 1px rgba(212, 176, 106, 0.2), 0 12px 40px -12px rgba(212, 176, 106, 0.25)",
        card: "0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 12px 40px -16px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
        soft: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        400: "400ms",
        600: "600ms",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 0.5s ease both",
        shimmer: "shimmer 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
