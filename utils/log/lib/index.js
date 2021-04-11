'use strict';

const log = require("npmlog");

log.level = process.env.LOG_LEVEL || 'info';
log.heading = "fri-cli";
log.addLevel('success', 2300, { fg: 'green', bg: 'black' });

log.debug = function () {
  process.env.LOG_LEVEL = "verbose";
  log.level = process.env.LOG_LEVEL;
}

module.exports = log;