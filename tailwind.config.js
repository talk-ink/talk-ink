const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slightGray: "#282F30",
      },
    },
    fontFamily: {
      sans: ["Rubik", "sans-serif"],
      body: ["Rubik", "sans-serif"],
    },
  },
  plugins: [],
};
