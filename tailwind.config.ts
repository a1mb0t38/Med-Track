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
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
};

export default config;
