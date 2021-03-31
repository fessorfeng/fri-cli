'use strict';

const cloneDeep = require("clone-deep");
const log = require('@fri-cli/log');


class Command {
  constructor(_argv) {
    const argv = cloneDeep(_argv);
    log.verbose("argv", argv);
    console.log(1111111111111);
    // launch the command
    let runner = new Promise((resolve, reject) => {
      // run everything inside a Promise chain
      let chain = Promise.resolve();

      chain = chain.then(() => this.init());
      chain = chain.then(() => this.exec());    
      chain.catch(err => {
        log.error(err.message);
      });
    });
  }

  init() {
    throw new Error('init 方法必须实现');
  }

  exec() {
    throw new Error('exec 方法必须实现');
  }
}

module.exports = Command;