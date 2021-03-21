'use strict';

// const log = require("npmlog");
const log = require("@fri-cli/log");

const pkInfo = require("../package.json");

function cli () {
  checkPackageVersion();
}

function checkPackageVersion () {
  log.info(pkInfo.version);
  console.log(2222);
}


module.exports = cli;