'use strict';

const log = require("npmlog");

log.addLevel('success', 2300, { fg: 'green', bg: 'black' });
log.heading = "fri-cli";

module.exports = log;