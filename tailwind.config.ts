// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",

  content: [
    "./index.html",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],


  theme: {
    extend: {
      colors: {
        primary: "#6824a3",

        background: {
          light: "#f6f8f7",
          dark: "#112117",
        },

        card: {
          light: "#E6E6EA",
          dark: "#1C1C26",
        },

        surface: {
          light: "#ffffff",
          dark: "#1a231e",
        },

        border: {
          light: "#f4e7e7",
          dark: "#3a2a2a",
        },

        shadow: {
          cardLight: "#D8D8DB",
          cardDark: "#000000",
        },

        text: {
          main: {
            light: "#1c0d0d",
            dark: "#fcf8f8",
          },
          sub: {
            light: "#9c4949",
            dark: "#d1a3a3",
          },
        },
      },
    },
  },

  plugins: [],
};
