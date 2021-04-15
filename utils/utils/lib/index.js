'use strict';

const path = require('path');
const Spinner = require('cli-spinner').Spinner;

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
  const child = spawn(command, args, options);
  // child.on('close', (code) => {
  //   console.log('close code', `子进程退出，退出码 ${code}`);
  // });
  // child.on('error', (code) => {
  //   console.log('error code', `子进程退出，退出码 ${code}`);
  // });
  // child.on('exit', (code) => {
  //   console.log('exit code', `exit ${code}`);
  // });
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
  }).catch(err => {
    reject(err);
  });
}

module.exports = {
  formatPath,
  cliSpinner,
  sleep,
  exec,
  execPromise
};
