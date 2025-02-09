/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        neonBlue: '#00FFFF',
        neonPink: '#FF00FF',
        neonGreen: '#00FF00',
        neonYellow: '#FFFF00',
      },
      dropShadow: {
        neon: '0px 0px 10px rgba(0, 255, 255, 0.8)',
    }},
  },
  plugins: [],
};
