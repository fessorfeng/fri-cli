'use strict';

const fs = require('fs');
const path = require('path');
const fsExtra = require('fs-extra');
const inquirer = require('inquirer');
const userHome = require('user-home');
const kebabCase = require('kebab-case');
const glob = require('glob');
const ejs = require('ejs');
const Command = require('@fri-cli/command');
const Package = require('@fri-cli/package');
const log = require('@fri-cli/log');
const request = require('@fri-cli/request');
const { cliSpinner, sleep, execPromise } = require('@fri-cli/utils');
const { includes } = require('user-home');

const INIT_TYPE_PROJECT = 'project';
const INIT_TYPE_COMPONENT = 'component';
const TPL_TYPE_NORMAL = 'normal';
const TPL_TYPE_CUSTOM = 'custom';

class initCommand extends Command {
  constructor(args) {
    super(Array.from(args));
  }

  init() {
    this.projectName = this._argv[0] || '';
    // 是否强制初始化
    this.isForceInit = !!this._options.force || false;
    // 模板列表
    // this.template = [];
  }

  async exec() {
    try {
      const projectInfo = await this.prepare();
      log.verbose('projectInfo', projectInfo);
      if (!projectInfo || !projectInfo.selectedTpl) return;
      this.projectInfo = projectInfo;
      await this.downloadTpl();
      await this.installTpl();
    } catch (err) {
      log.error(err.message);
    }
  }

  async prepare() {
    // 首先获取有无模板 无终止执行
    const tpls = await this.getTemplates();
    this.validTpls(tpls);
    this.template = tpls;

    const localPath = process.cwd();
    let confirmClear = false;
    // 判读目录是否为空
    if (this.isDirEmpty(localPath)) {
      // console.log("empty");
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
      // console.log("no ", confirmClear);
      // 清空
      fsExtra.emptyDirSync(localPath);
    }
    // 返回项目初始化信息
    return await this.getProjectInfo();
  }

  isDirEmpty(dir) {
    let res = fs.readdirSync(dir);
    res = res.filter(
      (name) => !name.startsWith('.') && !['node_modules'].includes(name)
    );
    return !(res && res.length);
  }

  isClearDir(msg = '当前目录不为空，是否清空目录？') {
    const questions = [
      {
        type: 'confirm',
        name: 'confirmClear',
        message: msg,
        default: false,
      },
    ];
    return inquirer.prompt(questions);
  }

  getTemplates() {
    return request.get('/tpl/lists');
  }

  async getProjectInfo() {
    // 1.首先校验 init 命令输入的项目名称
    function isValidName(v) {
      return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
        v
      );
    }
    const isProjectNameValid = isValidName(this.projectName);

    let questions = [];
    if (!isProjectNameValid) {
      questions.push({
        type: 'input',
        name: 'projectName',
        message: '请输入名称',
        default: '',
        validate: function (input) {
          var done = this.async();
          setTimeout(function () {
            if (!isValidName(input)) {
              done('名称不符规则，请重新输入！');
              return;
            }
            done(null, true);
          }, 3000);
        },
      });
    }
    questions = questions.concat([
      {
        type: 'input',
        name: 'version',
        message: '请输入版本',
        default: '1.0.0',
        validate: function (input) {
          var done = this.async();
          done(null, true);
        },
      },
      {
        type: 'list',
        name: 'type',
        message: '请选择项目初始化类型',
        default: INIT_TYPE_PROJECT,
        choices: [
          {
            name: '项目',
            value: INIT_TYPE_PROJECT,
          },
          {
            name: '组件',
            value: INIT_TYPE_COMPONENT,
          },
        ],
      },
    ]);
    // 1.1 成功继续 下一步
    // 1.2 否 inquirer.prompt 一系列问题 把项目名称 重新包含
    // 项目名称
    // 初始化项目类型 project component
    // 输入版本
    const info = await inquirer.prompt(questions);
    const { type } = info;
    const initTitle = type === INIT_TYPE_PROJECT ? '项目' : '组件';
    const choices = this.getChoice(this.template, type);
    this.validTpls(choices);
    // log.verbose('type', type);
    // 选取初始化模板
    const { selectedTpl } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTpl',
        message: `请选择${initTitle}模板`,
        choices,
      },
    ]);
    const { description } = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: `请输入${initTitle}描述`,
        default: '',
        validate: function (input) {
          var done = this.async();
          setTimeout(function () {
            if (!input) {
              done('不能为空，请重新输入！');
              return;
            }
            done(null, true);
          }, 3000);
        },
      },
    ]);
    let projectName = info.projectName || this.projectName;
    info.projectName = kebabCase(projectName).replace(/^-/, '');

    log.verbose('projectName', projectName);
    return { ...info, description, selectedTpl };
  }

  getChoice(tpls, type) {
    return tpls
      .filter((v) => v.initType === type)
      .map((tpl) => ({
        name: tpl.name,
        value: tpl.npmName,
      }));
  }

  validTpls(tpls) {
    if (!(Array.isArray(tpls) && tpls.length)) throw new Error('模板不存在！');
  }

  async downloadTpl() {
    // 准备package实例化的参数
    const targetPath = path.resolve(
      userHome,
      process.env.CLI_CACHE || '.fri_cli_cache',
      'templates'
    );
    const storeDir = path.resolve(targetPath, 'node_modules');
    const tpl = this.template.filter(
      (v) => v.npmName === this.projectInfo.selectedTpl
    )[0];
    this.selectedTpl = tpl;
    // log.verbose('tpl', tpl);
    // log.verbose('targetPath', targetPath);
    // log.verbose('storeDir', storeDir);
    const pk = new Package({
      storeDir,
      npmName: tpl.npmName,
      npmVersion: tpl.version,
      targetPath,
    });
    let spinner;
    let error = null;
    spinner = cliSpinner('模板信息获取中，请耐心等候...');
    const isExist = await pk.exists();
    try {
      spinner.stop(true);
      if (!isExist) {
        spinner = cliSpinner('模板下载中...');
        // 无，安装
        await pk.install();
      } else {
        spinner = cliSpinner('模板更新中...');
        // 有，检查更新
        await pk.update();
      }
    } catch (err) {
      // 有问题 有空检查一下一定要这样设置吗
      // log.debug();
      error = err;
    } finally {
      await sleep(1000);
      spinner.stop(true);
      // 缓存信息 安装使用到
      this.tplNpmPk = pk;
      if (error) {
        // log.error(error.message);
        throw new error();
      }
      const msg = `模板${isExist ? '更新' : '下载'}成功！`;
      log.success(msg);
    }
  }

  ejsRender(options) {
    return new Promise((resolve1, reject1) => {
      glob('**', options, (er, files) => {
        if (er) reject1(er);

        const {
          projectName: className,
          version,
          description,
        } = this.projectInfo;
        const data = { className, version, description };

        const options = {};
        Promise.all(
          files.map((file) => {
            return new Promise((resolve2, reject2) => {
              const filename = require('path').resolve(process.cwd(), file);
              ejs.renderFile(filename, data, options, function (err, str) {
                if (err) {
                  reject2(err);
                } else {
                  if (str) fsExtra.writeFileSync(filename, str);
                  resolve2(str);
                }
              });
            });
          })
        )
          .then((result) => {
            resolve1(result);
          })
          .catch((error) => {
            reject1(error);
          });
      });
    });
  }
  async installNormalTpl() {
    // log.info('normal');
    // 3.1 标准模版安装
    const targetPath = process.cwd();
    const template = path.resolve(this.tplNpmPk.cacheFilePath, 'template');
    console.log(targetPath, template);
    const spinner = cliSpinner('模板安装中...');
    let err;
    try {
      // 3.1.1 下载的模版缓存目录，复制文件的目录，确保存在
      fsExtra.ensureDirSync(targetPath);
      fsExtra.ensureDirSync(template);
      // 3.1.2 复制文件过去
      fsExtra.copySync(template, targetPath);
    } catch (error) {
      err = error;
    } finally {
      sleep();
      spinner.stop(true);
      if (err) throw err;
      log.success('模板安装成功！');
    }

    // 3.1.3 glob匹配文件ejs 渲染保存
    const options = {
      cwd: targetPath,
      ignore: ['**/public/**', '**/node_modules/**'],
      nodir: true,
    };
    await this.ejsRender(options);
    const { installCommand, startCommand } = this.selectedTpl;
    // 3.1.4 执行安装命令
    await this.execCmd(installCommand);
    // 3.1.5 执行运行命令
    await this.execCmd(startCommand);
  }
  checkCmd (cmd) {
    const res = ['npm', 'cnpm', 'yarn'].includes(cmd) ? cmd : null;
    if (!res) throw new Error(`命令${[cmd]}不合法！`);
    return res;
  }
  async execCmd(command) {
    const arr = command.split(' ');
    const cmd = this.checkCmd(arr[0]);
    const args = arr.splice(1);
    const options = {
      cwd: process.cwd(),
      stdio: 'inherit',
    };
    console.log(cmd, args, options);
    const res = await execPromise(cmd, args, options);
    if (res) throw new Error(`执行${[cmd].concat(args).join(' ')}不成功！`);
  }
  async installCustomTpl() {
    log.info('custom');
    // 3.2 自定义安装
    // 获取包rootfile 执行文件
    // 安装逻辑写在rootfile
    // 3.2.1 下载的模版缓存目录，复制文件的目录，确保存在
    // 3.2.2 复制文件过去
    // 3.2.3 glob匹配文件ejs 渲染保存
  }
  async installTpl() {
    // 1.存起选择的模版信息
    log.verbose('selectedTpl', this.selectedTpl);
    const selectedTpl = this.selectedTpl;
    // 2.判断模版是否自定义模版
    // 3.根据模版是否自定义安装
    switch (selectedTpl.type) {
      case TPL_TYPE_NORMAL:
        await this.installNormalTpl();
        break;
      case TPL_TYPE_CUSTOM:
        await this.installCustomTpl();
        break;
      default:
        throw new Error('未定义的模板类型');
        break;
    }
  }
}

function init() {
  return new initCommand(arguments);
}

module.exports = init;
module.exports.initCommand = initCommand;
