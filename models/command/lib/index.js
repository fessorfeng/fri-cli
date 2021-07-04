'use strict';

const cloneDeep = require("clone-deep");
const semver = require("semver");
const colors = require("colors/safe");
const log = require('@fri-cli/log');

class Command {
  constructor(_argv) {
    if (!_argv) {
      throw new Error('参数不能为空');
    }
    if (!Array.isArray(_argv)) {
      throw new Error('参数必须为数组');
    }
    if (_argv.length < 1) {
      throw new Error('参数列表不能为空');
    }
    const argv = cloneDeep(_argv);
    // log.verbose("argv", argv);


    let runner = new Promise((resolve, reject) => {
      // run everything inside a Promise chain
      let chain = Promise.resolve();

      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs(argv));
      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());    
      chain.catch(err => {
        log.error(err.message);
      });
    });
  }

  init() {
    throw new Error('init 方法必须实现');
  }

  exec() {
    throw new Error('exec 方法必须实现');
  }

  checkNodeVersion() {
    const currentVersion = process.version;
    const lowestVersion = process.env.NODE_LOWEST_VERSION || '13.0.0';
    // 如果当前版本较低，那么给用户一个提示
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(
        colors.red(`需要安装${lowestVersion}版本及以上的Node.js`)
      );
    }
  }

  initArgs(argv) {
    this._cmd = argv[argv.length - 1];
    this._argv = argv.slice(0, argv.length - 1);
    // 有问题需要查阅commander.js action 回调的参数用法
    this._options = argv[1];
  }
}

module.exports = Command;