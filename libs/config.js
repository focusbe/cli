const fse = require("fs-extra");
const path = require("path");
const configFile = path.resolve(process.cwd(), ".focusbe.config");
class Config {
  constructor(namespace = "") {
    this.globalConfig = null;
    this.namespace = namespace;
    this.curConfig = null;
  }
  async set(key, value) {
    await this.get();
    this.curConfig[key] = value;
    await fse.writeJSON(this.globalConfig, {
      space: 2,
    });
  }
  async get(key) {
    if (!this.globalConfig) {
      this.globalConfig = await fse.readJSON(configFile);
    }
    this.curConfig = this.namespace ? this.globalConfig : this.globalConfig[this.namespace];
    if (!key) {
      return this.curConfig;
    } else {
      return this.curConfig[key];
    }
  }
}
module.exports = Config;
