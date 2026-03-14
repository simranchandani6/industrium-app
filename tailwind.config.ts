import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#f6f3ec",
        ink: "#16202a",
        steel: "#5f6a72",
        panel: "#fffdf8",
        accent: "#efb126",
        accentDark: "#b27700",
        teal: "#0d8578",
        signal: "#ef6c45",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Avenir Next", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        panel: "0 24px 80px rgba(12, 24, 32, 0.08)",
      },
      backgroundImage: {
        grid:
          "linear-gradient(rgba(22,32,42,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(22,32,42,0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;

