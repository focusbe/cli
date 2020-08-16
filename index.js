#!/usr/bin/env node
const program = require("commander");
const fs = require("fs-extra");
const configFile = "./.focusbe";
class Focusbe{
    async static getConfig(){
       var res = await fs.exists(configFile);
       if(!res){
           return null;
       }
       var config = await fs.readJson(configFile);
       return config;
    }
    static create(){
        //创建一个全新的项目
    }
    async static init(config){
        //初始化已有项目
        return await fs.writeJson(configFile,config);
    }
    static publish(){
        //把
    }
}
program.version("1.0.0", "-v, --version").command("init <name>");
