import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        surfaceAlt: "var(--color-surface-alt)",
        border: "var(--color-border)",
        text: "var(--color-text)",
        textMuted: "var(--color-text-muted)",
        primary: "var(--color-primary)",
        primaryStrong: "var(--color-primary-strong)",
        accent: "var(--color-accent)",
        accentAlt: "var(--color-accent-alt)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        aiBg: "var(--color-ai-bg)"
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        glow: "var(--shadow-glow)"
      },
      borderRadius: {
        xl2: "1rem"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(37,99,235,0.14), transparent 30%), radial-gradient(circle at bottom right, rgba(16,185,129,0.14), transparent 30%)",
        "hero-grid-dark":
          "radial-gradient(circle at top left, rgba(255,42,133,0.25), transparent 28%), radial-gradient(circle at bottom right, rgba(157,0,255,0.25), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;
