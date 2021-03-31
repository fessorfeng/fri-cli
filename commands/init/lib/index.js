'use strict';

const Command = require('@fri-cli/command');

class initCommand extends Command{
  constructor(args) {
    super(args);
    // console.log(args);

  }

  init () {
    
  }

  exec () {
    
  }
}

function init() {
  return new initCommand(arguments);
}

module.exports = init;
module.exports.initCommand = initCommand;
