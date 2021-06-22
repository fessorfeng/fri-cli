/* eslint-disable import/no-dynamic-require, global-require */
const importLocal = require("import-local");

// TODO: sth
if (importLocal(__filename)) {
  require("npmlog").info("cli", "using local version of lerna");
} else {
  require("../lib")(process.argv.slice(2));
}