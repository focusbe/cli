const rollup = require("rollup");
const path = require("path");
const typescript = require("@rollup/plugin-typescript");
// const babel = require("@rollup/plugin-babel").babel;
const fse = require("fs-extra");
const stylus = require("stylus");
const poststylus = require("poststylus");
const browserSync = require("browser-sync");
const chokidar = require("chokidar");
class Build {
  constructor(basePath) {
    this.basePath = basePath;
    this.inputJs = path.resolve(this.basePath, "./scripts/main.ts");
    this.outputJs = this.inputJs.replace(".ts", ".js");
    this.inputCss = path.resolve(this.basePath, "./css/main.styl");
    this.outputCss = this.inputCss.replace(".styl", ".css");
  }
  start() {
    //
    //
    this.server();
    this.buildcss();
    this.buildjs();
  }
  server() {
    this.bs = browserSync({ server: this.basePath });
    chokidar
      .watch("./", {
        ignored: ["./css/*", "./scripts/*"],
        ignoreInitial: true,
      })
      .on("all", (event, file) => {
        this.bs.reload();
      });
  }
  buildcss() {
    this.postcss();
    chokidar
      .watch("./css", {
        ignoreInitial: true,
      })
      .on("all", (event, file) => {
        // console.log(event,path);
        // console.log(event, path);
        if (path.resolve(this.basePath, file) == this.outputCss) {
          return;
        }
        this.postcss();
      });
  }
  postcss() {
    fse.readFile(this.inputCss, (err, css) => {
      var st = stylus(css.toString());
      st.set("filename", this.inputCss)
        .use(poststylus(["autoprefixer"]))
        .render((err, css) => {
          if (err) throw err;
          fse.writeFile(this.outputCss, css, (err) => {
            if (!err) {
              this.bs.reload("./css/main.css");
            }
          });
        });
    });
  }
  async buildjs() {
    try {
      var outputOptions = {
        file: this.outputJs,
      };
      const watcher = rollup.watch({
        input: this.inputJs,
        plugins: [typescript()],
        output: outputOptions,
      });
      console.log(watcher.on);
      watcher.on("event", (event) => {
        if (event.code == "END") {
          this.bs.reload("./js/main.js");
        }
      });
      return true;
    } catch (err) {
      console.error("构建文件失败");
      console.error(err);
      return false;
    }
  }
}
module.exports = Build;
