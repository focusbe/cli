const Script = require("../modules/build/script");
Script({
  watch: true,
  input: ["./demos/js/main.js","./demos/js/b.js"],
  output: {
    dir:"./demos/dist/",
    format: "cjs",
    banner:'/**packaged by focusbe cli**/',
    compact:true
  },
});
