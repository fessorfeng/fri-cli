'use strict';

const path = require('path');
const pathExists = require("path-exists").sync;
const pkgDir = require('pkg-dir').sync;
const userHome = require('user-home');
 
const Package = require('@fri-cli/package');
const {formatPath} = require('@fri-cli/utils');

const cmdMap = {
  init: '@fri-cli/core',
};

function exec () {
  const args = arguments;
  const cmd = args[args.length - 1];
  const targetPath = process.env.targetPath || '';
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
    pk = new Package({
      storeDir,
      npmName,
      npmVersion,
      targetPath
    });
  } else {
    // 准备package实例化的参数
    storeDir = path.resolve(userHome, process.env.CLI_CACHE, 'dependencies');
    pk = new Package({
      storeDir,
      npmName,
      npmVersion,
      targetPath
    });
      // 使用pk检查是否本地缓存
        // 无，安装
        // 有，检查更新

  }
  console.log(storeDir);
  // console.log(npmName, formatPath(targetPath));
}

function getNpmNameByPath (pathPk) {
  if (!pathPk || !pathExists(pathPk)) return '';
  
  const rootPath = pkgDir(pathPk);
  const pkInfo = require(path.resolve(rootPath, 'package.json'));
  return pkInfo.name;

}

module.exports = exec;