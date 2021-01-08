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
const Config = require("./config");

const babel = require("@rollup/plugin-babel");
const fse = require("fs-extra");
const stylus = require("stylus");
const poststylus = require("poststylus");
const browserSync = require("browser-sync");
const chokidar = require("chokidar");
class Build {
  constructor(basePath, isDev = true) {
    this.basePath = basePath;
    
    this.isDev = isDev;
  }
  async start() {
    try {
      var customConfig = await Config.get() || {};
      var _defaultConfig = {
        js: [
          {
            input: "./js/main.js",
            output: "./js/bundle.js",
          },
        ],
        css: [
          {
            input: "./css/main.styl",
            output: "./css/main.css",
          },
        ],
      };
      customConfig = Object.assign(_defaultConfig, customConfig);
      this.Config = customConfig;
      if (this.isDev) {
        this.server();
      }
      this.buildcss();
      this.buildjs();
    } catch (error) {
      console.log(error);
    }
    
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
        let fullpath = path.resolve(this.basePath, file);

        for (var i in this.Config.css) {
          if (fullpath == path.resolve(this.basePath, this.Config.css[i].output)) {
            return;
          }
        }
        this.postcss();
      });
  }
  postcss() {
    this.Config.css.map(async (item) => {
      let input = path.resolve(this.basePath, item.input);
      console.log(input);
      if (!(await fse.pathExists(input))) {
        console.log("文件" + item.input + "不存在");
        return true;
      }
      let output = path.resolve(this.basePath, item.output);
      fse.readFile(input, (err, css) => {
        var st = stylus(css.toString());
        st.set("filename", item.input)
          .use(poststylus(["autoprefixer"]))
          .render((err, css) => {
            if (err) {
              delete err.input;
              console.error(err);
              return;
            }
            fse.writeFile(output, css, (err) => {
              if (!err && this.bs) {
                this.bs.reload(item.input);
              }
            });
          });
      });
    });
  }
  getFullPath(file) {
    return path.resolve(this.basePath, file);
  }
  getRelPath() {
    return path.relative(this.basePath, file);
  }
  async buildjs() {
    try {
      this.Config.js.map(async (item) => {
        let input = this.getFullPath(item.input);
        if (!(await fse.pathExists(input))) {
          console.log("文件" + item.input + "不存在");
          return;
        }
        let output = this.getFullPath(item.output);
        var outputOptions = {
          file: output,
          format: "iife",
        };
        var rollupConfig = {
          input: input,
          plugins: [
            commonjs(),
            resolve(),
            babel.babel({
              exclude: /(babel|corejs|core-js)/, //千万不要babel babel的代码
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
          output: outputOptions,
        };
        const watcher = rollup.watch(rollupConfig);
        watcher.on("event", (event) => {
          if (event.code.indexOf("ERROR") > -1) {
            console.log(event);
          }
          if (event.code == "END" && this.bs) {
            this.bs.reload(item.output);
          }
        });
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
