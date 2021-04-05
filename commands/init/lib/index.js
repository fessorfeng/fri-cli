'use strict';

const fs = require('fs');
const fsExtra = require('fs-extra');
const inquirer = require('inquirer');
const Command = require('@fri-cli/command');
const log = require('@fri-cli/log');

class initCommand extends Command{
  constructor(args) {
    super(Array.from(args));
  }

  init() {
    this.projectName = this._argv[0] || '';
    // 是否强制初始化
    this.isForceInit = !!this._options.force || false;
    
  }

  async exec() {
    try {
      await this.prepare();
    } catch (err) {
      log.error(err.message);
    }
    
    
  }

  async prepare() {
    const localPath = process.cwd();
    let confirmClear = false;
    // 判读目录是否为空
    if (this.isDirEmpty(localPath)) {
      console.log('empty');
    } else {
      // 不为空，询问是否清空
      if (!this.isForceInit) {
        confirmClear = (await this.isClearDir())['confirmClear'] || false;
      }
      if (confirmClear || this.isForceInit) {
        const msg = '当前目录不为空，请再确认是否清空目录？';
        confirmClear = (await this.isClearDir(msg))['confirmClear'] || false;
      }
      // 不清空 终止执行
      if (!confirmClear) return;
      console.log('no ', confirmClear);
      // 清空
      fsExtra.emptyDirSync(localPath);
    }
  }

  isDirEmpty(dir) {
    let res = fs.readdirSync(dir);
    res = res.filter(name => !name.startsWith('.') && !['node_modules'].includes(name));
    return !(res && res.length);
  }

  isClearDir(msg = '当前目录不为空，是否清空目录？') {
    const questions = [
      {
        type: 'confirm',
        name: 'confirmClear',
        message: msg,
        default: false,
      }
    ];
    return inquirer.prompt(questions);
  }


}

function init() {
  return new initCommand(arguments);
}

module.exports = init;
module.exports.initCommand = initCommand;
