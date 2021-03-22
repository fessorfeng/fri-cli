'use strict';

const log = require("npmlog");

log.level = process.env.LOG_LEVEL || 'info';
log.heading = "fri-cli";
log.addLevel('success', 2300, { fg: 'green', bg: 'black' });

module.exports = log;