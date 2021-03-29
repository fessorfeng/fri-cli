'use strict';

const path = require('path');
const pathExists = require("path-exists").sync;
const pkgDir = require('pkg-dir').sync;
const userHome = require('user-home');
 
const Package = require('@fri-cli/package');
const {formatPath} = require('@fri-cli/utils');

const cmdMap = {
  // init: '@fri-cli/core',
  init: '@imooc-cli/init',
};

async function exec () {
  const args = arguments;
  const cmd = args[args.length - 1];
  let targetPath = process.env.targetPath || '';
  const cmdName = cmd.name();
  const npmName = getNpmNameByPath(targetPath) ||
    cmdMap[cmdName];
  let storeDir = '';
  let npmVersion = 'latest';
  
  if (targetPath && !pathExists(targetPath)) {
    throw new Error('路径输入有误，不存在请检查');
  }
  let pk;
  if (targetPath) {
    console.log(1);
    pk = new Package({
      storeDir,
      npmName,
      npmVersion,
      targetPath
    });
  } else {
    console.log(2);
    // 准备package实例化的参数
    targetPath = path.resolve(userHome, process.env.CLI_CACHE, 'dependencies');
    storeDir = path.resolve(targetPath, 'node_modules');

    pk = new Package({
      storeDir,
      npmName,
      npmVersion,
      targetPath
    });
    // 使用pk检查是否本地缓存
    if (!pk.exists()) {
      // 无，安装
      await pk.install();
    } else {
      // 有，检查更新
      await pk.update();
    } 
  }
  const rootFile = pk.getNpmRootFile();
  console.log(storeDir,targetPath,1111, rootFile);
}

function getNpmNameByPath (pathPk) {
  if (!pathPk || !pathExists(pathPk)) return '';
  
  const rootPath = pkgDir(pathPk);
  const pkInfo = require(path.resolve(rootPath, 'package.json'));
  return pkInfo.name;

}

module.exports = exec;