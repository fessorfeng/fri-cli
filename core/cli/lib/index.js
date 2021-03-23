"use strict";

const path = require("path");
const colors = require("colors/safe");
const userHome = require("user-home");
const pathExists = require("path-exists").sync;
const log = require("@fri-cli/log");
const { getNpmSemverVersions } = require("@fri-cli/get-npm-info");
// const pkg = require(path.resolve(__dirname, "../package.json"));
const fs = require('fs');
// fessorwrite
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json")));
const CONST = require("./constant");

function cli() {
  try {
    // 检查cli版本号
    checkPackageVersion();
    // 检查Node版本号
    checkNodeVersion();
    // 检查是否root启动 防止root创建 以后因为权限不能修改
    checkRoot();
    // 检查是否用户主目录
    checkUserHome();
    // 检查入参
    checkInputArgs();
    // 检查环境变量
    checkEnv();
    // 检查cli是否最新版本-》否提示更新
    chekckGlobalUpdate();
  } catch (err) {
    log.error(err.message);
  }
}

function checkPackageVersion() {
  log.info("version", pkg.version);
}

function checkNodeVersion() {
  const semver = require("semver");
  const currentVersion = process.version;
  const lowestVersion = CONST.NODE_LOWEST_VERSION;
  // 如果当前版本较低，那么给用户一个提示
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      colors.red(`${pkg.name} 需要安装${lowestVersion}版本及以上的Node.js`)
    );
  }
}

function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red("当前用户主目录不存在，请检查!"));
  }
}

function checkInputArgs() {
  const args = require("minimist")(process.argv.slice(2));
  process.env.LOG_LEVEL = args.debug ? "verbose" : "info";
  log.level = process.env.LOG_LEVEL;
}

function checkEnv() {
  const dotenv = require('dotenv');
  const dotenvPath = path.resolve(process.cwd(), '.env');
  let config;
  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path: dotenvPath
    }).parsed;
  }
}

async function chekckGlobalUpdate() {
  const versions = await getNpmSemverVersions(pkg.name, pkg.version);
  if (versions && versions.length) {
    const pkName = Object.keys(pkg.bin)[0];
    log.warn(colors.yellow(`${pkName}有最新版本（${versions[0]}）请npm install ${pkg.name}进行更新`));
  }
}

module.exports = cli;