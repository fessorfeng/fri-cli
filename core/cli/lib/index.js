'use strict';

const log = require("npmlog");

const pkInfo = require("../package.json");

function cli () {
  checkPackageVersion();
}

function checkPackageVersion () {
  log.info(pkInfo.version);
}


module.exports = cli;