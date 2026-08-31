import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg)",
        fg: "var(--color-fg)",
        accent: "var(--color-accent)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        subtle: "var(--color-subtle)",
        overlay: "var(--color-overlay)",
        forest: "var(--color-forest)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      transitionTimingFunction: {
        smooth: "var(--ease-out)",
      },
      keyframes: {
        countdown: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "50%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(1.2)", opacity: "0" },
        },
      },
      animation: {
        countdown: "countdown 1s var(--ease-out) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
