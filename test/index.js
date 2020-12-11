const Script = require("../modules/build/script");
Script({
  watch: true,
  basePath: "demos",
  publicPath: "",
  input: "**/*.js",
  chainRollup: [],
  css: {

  },
  output: {
    dir: "dist",
    format: "cjs",
    assetsDir:'static'
  },
  on(event) {
    console.log(event);
  },
});
