#!/usr/bin/env node
"use strict";

var commander = require("commander");

var DevTools = require("@ztgame/devtools");

var devTools = new DevTools();

var Build = require("./build");

commander.version("1.0.0", "-v, --version").command("init").action(function () {
  devTools.init();
});
commander.command("dev").action(function () {});
commander.command("pubdev").action(function () {
  devTools.pubdev();
});
commander.parse(process.argv);