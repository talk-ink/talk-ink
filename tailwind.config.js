const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slightGray: "#282F30",
        accent: "#6F6CD9",
      },
      keyframes: {
        showToast: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0px)" },
        },
        easeOpacity: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        showToast: "showToast 0.1s ease-in-out",
        easeOpacity: "easeOpacity 0.1s ease-in",
      },
    },
    fontFamily: {
      sans: ["Rubik", "sans-serif"],
      body: ["Rubik", "sans-serif"],
      roboto: ["Roboto"],
      montserrat: ["montserrat"],
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
