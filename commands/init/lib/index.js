"use strict";

const fs = require("fs");
const path = require("path");
const fsExtra = require("fs-extra");
const inquirer = require("inquirer");
const userHome = require("user-home");
const Command = require("@fri-cli/command");
const Package = require("@fri-cli/package");
const log = require("@fri-cli/log");
const request = require("@fri-cli/request");

const INIT_TYPE_PROJECT = 'project';
const INIT_TYPE_COMPONENT = 'component';

class initCommand extends Command {
  constructor(args) {
    super(Array.from(args));
  }

  init() {
    this.projectName = this._argv[0] || "";
    // 是否强制初始化
    this.isForceInit = !!this._options.force || false;
    // 模板列表
    // this.template = [];
  }

  async exec() {
    try {
      const projectInfo = await this.prepare();
      // log.verbose("projectInfo", projectInfo);
      this.projectInfo = projectInfo;
      await this.downloadTpl();
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
        confirmClear = (await this.isClearDir())["confirmClear"] || false;
      }
      if (confirmClear || this.isForceInit) {
        const msg = "当前目录不为空，请再确认是否清空目录？";
        confirmClear = (await this.isClearDir(msg))["confirmClear"] || false;
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
      (name) => !name.startsWith(".") && !["node_modules"].includes(name)
    );
    return !(res && res.length);
  }

  isClearDir(msg = "当前目录不为空，是否清空目录？") {
    const questions = [
      {
        type: "confirm",
        name: "confirmClear",
        message: msg,
        default: false,
      },
    ];
    return inquirer.prompt(questions);
  }

  getTemplates() {
    return request.get("/tpl/lists");
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
        type: "input",
        name: "projectName",
        message: "请输入项目名称",
        default: "",
        validate: function (input) {
          var done = this.async();
          setTimeout(function () {
            if (!isValidName(input)) {
              done("名称不符规则，请重新输入！");
              return;
            }
            done(null, true);
          }, 3000);
        },
      });
    }
    questions = questions.concat([
      {
        type: "input",
        name: "version",
        message: "请输入版本",
        default: "1.0.0",
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
            value: INIT_TYPE_PROJECT
          },
          {
            name: '组件',
            value: INIT_TYPE_COMPONENT
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
    const choices = this.getChoice(this.template, type);
    this.validTpls(choices);
    // log.verbose('type', type);
    // 选取初始化模板
    const { selectedTpl } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTpl',
        message: '请选择模板',
        choices,
      }
    ]);
    
    return { ...info, selectedTpl };
  }

  getChoice(tpls, type) {
    return tpls.filter(v => v.type === type).map(tpl => ({
      name: tpl.name,
      value: tpl.npmName
    }));
  }

  validTpls(tpls) {
    if (!(Array.isArray(tpls) && tpls.length)) throw new Error("模板不存在！");
  }

  async downloadTpl() {
    // 准备package实例化的参数
    const targetPath = path.resolve(userHome, process.env.CLI_CACHE ||'.fri_cli_cache', 'templates');
    const storeDir = path.resolve(targetPath, 'node_modules');
    const tpl = this.template.filter(v => v.npmName === this.projectInfo.selectedTpl)[0];
    // log.verbose('tpl', tpl);
    // log.verbose('targetPath', targetPath);
    // log.verbose('storeDir', storeDir);
    const pk = new Package({
      storeDir,
      npmName: tpl.npmName,
      npmVersion: tpl.version,
      targetPath
    });
    if (!await pk.exists()) {
      // 无，安装
      await pk.install();
    } else {
      // 有，检查更新
      await pk.update();
    } 
  }
}

function init() {
  return new initCommand(arguments);
}

module.exports = init;
module.exports.initCommand = initCommand;