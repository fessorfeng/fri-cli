'use strict';

const path = require('path');
const {spawn} = require('child_process');
const pathExists = require("path-exists").sync;
const pkgDir = require('pkg-dir').sync;
const userHome = require('user-home');
 
const Package = require('@fri-cli/package');
const {execPromise} = require('@fri-cli/utils');
const log = require('@fri-cli/log');

const cmdMap = {
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
    pk = new Package({
      storeDir,
      npmName,
      npmVersion,
      targetPath
    });
  } else {
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
    if (!await pk.exists()) {
      // 无，安装
      await pk.install();
    } else {
      // 有，检查更新
      await pk.update();
    } 
  }
  const rootFile = pk.getNpmRootFile();
  if (rootFile) {
    try {
      const args = Array.from(arguments);
      let cmdObj = args[args.length - 1];
      let o = Object.assign({});
      Object.keys(cmdObj).forEach(key => {
        if (key !== 'parent' && !key.startsWith('_') && cmdObj.hasOwnProperty(key)) {
          o[key] = cmdObj[key];
        }
      });
      args[args.length - 1] = o;
      // require(rootFile).apply(null, args);
      // log.verbose(rootFile);
      const code = `require('${rootFile}').apply(null, ${JSON.stringify(args)})`;
      // log.verbose(code);
      const res = await execPromise('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
      log.verbose('res:', res);
      if (res) throw new Error('执行不成功！');
     
    } catch (error) {
      log.error(error.message);
    }
  }
}

function getNpmNameByPath (pathPk) {
  if (!pathPk || !pathExists(pathPk)) return '';
  
  const rootPath = pkgDir(pathPk);
  const pkInfo = require(path.resolve(rootPath, 'package.json'));
  return pkInfo.name;

}

module.exports = exec;