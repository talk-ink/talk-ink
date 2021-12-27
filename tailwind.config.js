const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slightGray: "#282F30",
        accent: "#6F6CD9",
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
