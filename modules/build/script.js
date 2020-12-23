const rollup = require("rollup");
const chokidar = require("chokidar");
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

//获取rollup config

class Script {
  constructor(options) {
    var _options = {
      dev: false, //是否调试
      basePath: "", //项目的目录文件
      publicPath: "", //资源文件的前缀
      input: "", //入口文件
      chainRollup: [], //rollup的其他配置
      css: {}, //css相关配置
      output: {
        //输出相关配置
        base: "dist", //输出的根目录
        js: "", //js的目录
        keepDir: true, //保留原来的目录
        format: "iife", //格式
        assets: "", //资源文件目录
      },
      on: {
        //打包的回调函数
        start() {},
        end() {},
        error() {},
      },
    };
    this.options = lodash.merge(_options, options);
    this.init();
  }
  join(...arms){
    var url = path.join(...arms).replace(/\\/g,'/');
    return url;
  }
  async init() {
    var rollupConfigs = await this.getRollupConfig();
    if (rollupConfigs) {
      rollupConfigs.map(async (item) => {
        try {
          const bundle = await rollup.rollup(item);
          await bundle.write(item.output);
        } catch (error) {
          console.log(error);
        }
      });
    }
  }
  getBasePath(relativePath) {
    return path.join(this.options.basePath, relativePath);
  }
  getDestPath(relativePath) {
    return path.join(this.options.basePath, this.options.output.base, relativePath);
  }
  async getRollupConfig() {
    var basePath = path.resolve(process.cwd(), this.options.basePath);
    //查找所有的input文件
    var files = await new Promise((resolve, reject) => {
      glob(this.options.input, { cwd: basePath }, function (err, files) {
        resolve(files);
      });
    });
    var _rollupConfig = {
      plugins: [
        commonjs(),
        resolve(),
        url({
          destDir: this.getDestPath(this.options.output.assets),
          publicPath:  this.options.output.assets,
        }),
        css(
          lodash.merge(
            {
              inject: true,
              plugins: [autoprefixer],
            },
            this.options.css
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
    var rollupConfigs = [];
    if (files.length > 0) {
      files.map((item) => {
        let curconfig = Object.assign({}, _rollupConfig);
        curconfig.input = this.getBasePath(item);
        curconfig.output = {
          dir: this.getDestPath(this.options.output.js),
        };
        rollupConfigs.push(curconfig);
      });
      return rollupConfigs;
    }
    return null;
  }
}

module.exports = Script;
