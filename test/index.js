const Script = require("../modules/build/script");
new Script({
  watch: true,
  basePath: "demos",
  publicPath: "",
  input: "**/*.js",
  output: {
    base:'dist',
    js:'js'
  },
  on(event) {
    console.log(event);
  },
});
