'use strict';

const path = require('path');
const Spinner = require('cli-spinner').Spinner;

function formatPath (p) {
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

function sleep(time){
  return new Promise(resolve => setTimeout(resolve, time));
}

module.exports = {
  formatPath,
  cliSpinner,
  sleep
};


