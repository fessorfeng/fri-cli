'use strict';

const Package = require('@fri-cli/package');

const cmdMap = {
  init: '@fri-cli/core',
};

function exec() {
  const args = arguments;
  const cmd = args[args.length - 1];
  console.log(cmd.name(), process.env.targetPath);
}

module.exports = exec;