const rollup = require("rollup");
var lodash = require("lodash");
const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve").default;
const babel = require("@rollup/plugin-babel");
const json = require("@rollup/plugin-json");
const html = require("rollup-plugin-posthtml-template");
const css = require("rollup-plugin-postcss");
const url = require("@rollup/plugin-url");
const autoprefixer = require("autoprefixer");
const glob = require("glob");
const path = require("path");
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

async function getRollupConfig(config) {
  var defaultConfig = {
    dev: false, //是否调试
    basePath: "", //项目的目录文件
    publicPath: "", //资源文件的前缀
    input: "", //入口文件
    chainRollup: [], //rollup的其他配置
    css: {}, //css相关配置
    output: {
      //输出相关配置
      dir: "dist", //输出的目录
      format: "iife", //格式
      assetsDir: "static", //资源文件目录
    },
    on: {
      //打包的回调函数
      start() {},
      end() {},
      error() {},
    },
  };
  var config = lodash.merge(defaultConfig, config);

  var basePath = path.resolve(process.cwd(), config.basePath);
  console.log(basePath);
  var files = await new Promise((resolve, reject) => {
    glob(config.input, { cwd: basePath }, function (err, files) {
      // files is an array of filenames.
      // If the `nonull` option is set, and nothing
      // was found, then files is ["**/*.js"]
      // er is an error object or null.
      console.log(err, files);
    });
  });

  var rollupConfig = {
    watch: config.dev,
    plugins: [
      commonjs(),
      resolve(),
      url({
        destDir: path.join(config.output.dir, config.output.assetsDir),
        publicPath: path.join("./", config.assetsDir),
      }),
      css(
        lodash.merge(
          {
            inject: true,
            plugins: [autoprefixer],
          },
          config.css
        )
      ),
      json(),
      html({
        include: "../**/*.{html,sgr,shtml,tpl}",
      }),
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
}

async function script(options) {
  getRollupConfig(options);
  return;
  try {
    var defaultOptions = {
      watch: false,
      plugins: [
        commonjs(),
        resolve(),
        url({
          destDir: options.output.dir + "static/",
          publicPath: "./static/",
        }),
        css({
          inject: true,
          plugins: [autoprefixer],
        }),
        json(),
        html({
          include: "../**/*.{html,sgr,shtml,tpl}",
        }),
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
