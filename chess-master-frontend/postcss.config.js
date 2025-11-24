module.exports = {
  plugins: [
    require("tailwindcss"), // <- this fails in clean env
    require("autoprefixer"),
  ],
};
