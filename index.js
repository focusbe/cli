#!/usr/bin/env node
const commander = require("commander");
const DevTools = require("@ztgame/devtools");
var devTools = new DevTools();
const Build = require("./build");
//
var projectRoot = process.cwd();
var build = new Build(projectRoot);
commander
  .version("1.0.0", "-v, --version")
  .command("init")
  .action(() => {
    devTools.init();
  });
commander.command("dev").action(() => {
  build.start();
});
commander.command("pubdev").action(() => {
  devTools.pubdev();
});

commander.parse(process.argv);
