const fse = require("fs-extra");
const path = require("path");
console.log(111);
const configFile = path.resolve(process.cwd(), ".focusbe.config");
class ConfigObj {
  constructor() {
    this.config = null;
  }
  async set(key, value) {}
  async get(key) {
    if (!this.config) var res = fse.readJSON(configFile);
    if (!key) {
      return res;
    } else {
      return res[key];
    }
  }
  static save() {}
}
const Config = new ConfigObj();
module.exports = Config;
