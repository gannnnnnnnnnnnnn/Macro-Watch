import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07090f",
        panel: "#10141d",
        line: "#252b38",
        gain: "#32d583",
        loss: "#fb7185",
        warn: "#fbbf24",
      },
    },
  },
  plugins: [],
};

export default config;
