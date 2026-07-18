import type { Config } from "tailwindcss";

/**
 * In HeroUI v3 (coinciding with Tailwind CSS v4), CSS-first imports are used 
 * instead of JS/TS plugins. We define a local heroui helper here to maintain 
 * compatibility with standard Tailwind configurations and satisfy TypeScript.
 */
export function heroui() {
  return () => {};
}

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /**
       * These map to the CSS custom properties defined in globals.css via @theme.
       * They allow TypeScript-aware code to reference design tokens by name.
       * In Tailwind v4, the @theme CSS block already generates the utility classes;
       * these entries add TS config awareness for tooling.
       */
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          50:  "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          950: "var(--color-primary-950)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          50:  "var(--color-accent-50)",
          100: "var(--color-accent-100)",
          200: "var(--color-accent-200)",
          300: "var(--color-accent-300)",
          400: "var(--color-accent-400)",
          500: "var(--color-accent-500)",
          600: "var(--color-accent-600)",
          700: "var(--color-accent-700)",
          800: "var(--color-accent-800)",
          900: "var(--color-accent-900)",
          950: "var(--color-accent-950)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          50:  "var(--color-warning-50)",
          100: "var(--color-warning-100)",
          200: "var(--color-warning-200)",
          300: "var(--color-warning-300)",
          400: "var(--color-warning-400)",
          500: "var(--color-warning-500)",
          600: "var(--color-warning-600)",
          700: "var(--color-warning-700)",
          800: "var(--color-warning-800)",
          900: "var(--color-warning-900)",
          950: "var(--color-warning-950)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          50:  "var(--color-danger-50)",
          100: "var(--color-danger-100)",
          200: "var(--color-danger-200)",
          500: "var(--color-danger-500)",
          600: "var(--color-danger-600)",
          900: "var(--color-danger-900)",
          950: "var(--color-danger-950)",
        },
        neutral: {
          50:  "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
          950: "var(--color-neutral-950)",
        },
      },
      borderRadius: {
        card: "12px",
        sm: "8px",
        pill: "9999px",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;
