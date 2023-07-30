#!/usr/bin/env node
const commander = require('commander');
const fs = require('fs');
const Build = require('./build');
var projectRoot = process.cwd();
var build = new Build(projectRoot);
commander
    .version('1.0.0', '-v, --version')
    .command('init')
    .action(() => {
        //初始化项目
        // 将模板文件拷贝到项目中
        // 监测是否有package.json文件
        if (fs.existsSync(projectRoot + '/package.json')) {
            console.warn('请在空项目中初始化');
            return;
        }
        fs.copyDirSync(__dirname + '/template', projectRoot);
        // 将依赖安装到项目中
    });
commander.command('dev').action(() => {
    build.start();
});

commander.parse(process.argv);
