#!/usr/bin/env node
const commander = require("commander");
const fs = require("fs-extra");
const DevTools = require("@ztgame/devtools");
var devTools = new DevTools();
commander
  .version("1.0.0", "-v, --version")
  .command("init")
  .action(() => {
    devTools.init();
  });
commander.command("pubdev").action(() => {
  devTools.pubdev();
});
commander.parse(process.argv);
