/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        palette: {
          bgPrimary: "var(--bg-primary)",
          bgSecondary: "var(--bg-secondary)",
          bgTertiary: "var(--bg-tertiary)",
          bgSidebar: "var(--bg-sidebar)",
          border: "var(--border-color)",
          textPrimary: "var(--text-primary)",
          textSecondary: "var(--text-secondary)",
          accent: "var(--accent-primary)",
          accentHover: "var(--accent-hover)",
        },
      },
    },
  },
  plugins: [],
};

