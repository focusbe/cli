const rollup = require("rollup");
const path = require("path");
const babel = require("@rollup/plugin-babel");
const getBabelOutputPlugin = babel.getBabelOutputPlugin;

const fse = require("fs-extra");
const stylus = require("stylus");
const poststylus = require("poststylus");
const browserSync = require("browser-sync");
const chokidar = require("chokidar");
class Build {
  constructor(basePath, isDev = true) {
    this.isDev = isDev;
    this.basePath = basePath;
    this.inputJs = path.resolve(this.basePath, "./scripts/main.js");
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
  }
  async buildjs() {
    try {
      var outputOptions = {
        file: this.outputJs,
      };
      const watcher = rollup.watch({
        input: this.inputJs,
        plugins: [
          babel.babel({
            exclude: /(node_modules|babel|corejs|core-js)/, //千万不要babel babel的代码
            babelHelpers: "bundled",
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    browsers: "last 3 version ,ie >= 8",
                  },
                },
              ],
            ],
            // plugins: [
            //   [
            //     "@babel/plugin-transform-runtime",
            //     {
            //       corejs: 3,
            //       regenerator: true,
            //     },
            //   ],
            // ],
          }),
        ],
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
