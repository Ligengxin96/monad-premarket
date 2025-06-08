import type { Config } from "tailwindcss";
import { heroui } from "@heroui/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    // make sure it's pointing to the ROOT node_module
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        bounce: "bounce 0.6s infinite",
        "shooting-star": "shooting 8s linear infinite",
      },
      transitionDelay: {
        "200": "200ms",
        "300": "300ms",
        "400": "400ms",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
export default config;
