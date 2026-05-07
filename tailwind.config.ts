import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          navy:       "#170C79",
          "navy-light": "#2A1E9A",
          beige:      "#EFE3CA",
          "beige-dark": "#DDD0B4",
          blue:       "#56B6C6",
          "blue-dark":"#3E9EAD",
          sea:        "#8ACBD0",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};

export default config;
