'use strict';

const path = require('path');
const Spinner = require('cli-spinner').Spinner;
const semver = require('semver');

function formatPath(p) {
  if (p && typeof p === 'string') {
    if (path.sep === '/') {
      return p;
    } else {
      return p.replace(/\\/g, '/');
    }
  }
  return p;
}

function cliSpinner(text = 'processing..', sign = '|/-\\') {
  const spinner = new Spinner(`${text} %s`);
  spinner.setSpinnerString(sign);
  spinner.start();
  return spinner;
}

function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function exec(command = '', args = [], options = {}) {
  const { spawn } = require('child_process');
  const win32 = process.platform === 'win32';

  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
  const child = spawn(cmd, cmdArgs, options);
  return child;
}

function execPromise (command = '', args = [], options = {}) {
  const child = exec(command, args, options);
  return new Promise((resolve, reject) => {
    child.on('error', (code) => {
      reject(code);
    });
    child.on('exit', (code) => {
      resolve(code);
    });
  });
}

// 返回null 无效
function validVersion (version) {
  return semver.valid(version);
}

const { hasYarn } = require('./aboutYarn');
const { registries } = require('./registries');
const shouldUseTaobao = require('./shouldUseTaobao');

module.exports = {
  formatPath,
  cliSpinner,
  sleep,
  exec,
  execPromise,
  hasYarn,
  registries,
  shouldUseTaobao,
  validVersion
};
