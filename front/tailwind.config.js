/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        bounceSmooth: {
          "0%, 100%": { transform: "translateY(0)" },
          "25%": { transform: "translateY(-20%)" },
          "50%": { transform: "translateY(0)" },
          "75%": { transform: "translateY(-10%)" },
        },
      },
      animation: {
        bounceSmooth: "bounceSmooth 2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
