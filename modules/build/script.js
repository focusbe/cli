const rollup = require("rollup");
var lodash = require("lodash");
const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve").default;
const babel = require("@rollup/plugin-babel");
const image = require("@rollup/plugin-image");
const json = require("@rollup/plugin-json");
const html = require("rollup-plugin-posthtml-template");
const css = require("rollup-plugin-postcss");
const url = require("@rollup/plugin-url");
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

async function script(options) {
  try {
    var defaultOptions = {
      basePath: "./",
      input: null,
      watch: false,
      assets: {
        html: true,
        css: true,
        json: true,
        images: true,
      },
      plugins: [
        commonjs(),
        resolve(),
        url(),
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
                  browsers: "ie >= 8",
                },
              },
            ],
          ],
        }),
      ],
    };
    options = lodash.merge(defaultOptions, options);
    if (options.css) {
    }
    if (!options.input) {
      throw new Error("缺少input参数");
    }

    if (options.watch) {
      const watcher = rollup.watch(options);
      watcher.on("event", (event) => {
        if (options.on) {
          options.on(event);
        }
        // if (event.code.indexOf("ERROR") > -1) {
        //   console.log(event);
        // }
        // if (event.code == "END" && this.bs) {
        //   this.bs.reload("./js/bundle.js");
        // }
      });
    } else {
      const bundle = await rollup.rollup(options);
      await bundle.write(options.output);
    }

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
module.exports = script;
