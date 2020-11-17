const rollup = require("rollup");
const path = require("path");
const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve").default;
try {
  require("@babel/preset-env");
} catch (error) {
  return;
}
try {
  require("@babel/core");
} catch (error) {
  return;
}

const babel = require("@rollup/plugin-babel");

const fse = require("fs-extra");
const stylus = require("stylus");
const poststylus = require("poststylus");
const browserSync = require("browser-sync");
const chokidar = require("chokidar");
class Build {
  constructor(basePath, isDev = true) {
    this.isDev = isDev;
    this.basePath = basePath;
    let scriptDir = path.resolve(this.basePath, "./scripts");
    if (fse.existsSync(scriptDir)) {
      this.inputJs = path.resolve(this.basePath, "./scripts/main.js");
    } else {
      this.inputJs = path.resolve(this.basePath, "./js/main.js");
    }

    this.outputJs = this.inputJs.replace("main.js", "bundle.js");
    this.inputCss = path.resolve(this.basePath, "./css/main.styl");
    this.outputCss = this.inputCss.replace(".styl", ".css");
  }
  start() {
    //
    //
    if (this.isDev) {
      this.server();
    }

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
        if (path.resolve(this.basePath, file) == this.outputCss) {
          return;
        }
        this.postcss();
      });
  }
  postcss() {
    try {
      fse.readFile(this.inputCss, (err, css) => {
        var st = stylus(css.toString());
        st.set("filename", this.inputCss)
          .use(poststylus(["autoprefixer"]))
          .render((err, css) => {
            if (err) throw err;
            fse.writeFile(this.outputCss, css, (err) => {
              if (!err && this.bs) {
                this.bs.reload("./css/main.css");
              }
            });
          });
      });
    } catch (error) {
      console.log(error);
    }
  }
  async buildjs() {
    try {
      var outputOptions = {
        file: this.outputJs,
        format: "iife",
      };
      const watcher = rollup.watch({
        input: this.inputJs,
        plugins: [
          commonjs(),
          resolve(),
          babel.babel({
            exclude: /(node_modules|babel|corejs|core-js)/, //千万不要babel babel的代码
            babelHelpers: "bundled",
            presets: [
              [
                "@babel/preset-env",
                {
                  useBuiltIns: "usage",
                  corejs: 3,
                  targets: {
                    browsers: "last 4 version ,ie >= 8",
                  },
                },
              ],
            ],
          }),
        ],
        // external: function (filename, pluginFile) {
        //   // console.log(filename, pluginFile);
        //   return false;
        // },
        output: outputOptions,
      });
      watcher.on("event", (event) => {
        if (event.code.indexOf("ERROR") > -1) {
          console.log(event);
        }
        if (event.code == "END" && this.bs) {
          this.bs.reload("./js/bundle.js");
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
