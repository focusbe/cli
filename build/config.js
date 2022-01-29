const fse = require("fs-extra");
const path = require("path");
const configFile = path.resolve(process.cwd(), ".focusbe.config");
class ConfigObj {
  constructor() {
    this.config = null;
  }
  async set(key, value) {}
  async get(key) {
    try {
      if(!await fse.pathExists(configFile)){
        return null;
      }
      if (!this.config) var res = fse.readJSON(configFile);
      if (!key) {
        return res;
      } else {
        return res[key];
      }
    } catch (error) {
      return null;
    }
  }
  static save() {}
}
const Config = new ConfigObj();
module.exports = Config;
