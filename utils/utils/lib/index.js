'use strict';

const path = require('path');

function formatPath(p) {
  if (p && typeof p === 'string') {
    if (path.sep === '/') {
      return p;
    } else {
      return p.replace(/\\/g, path.sep);
    }
  }
  return p;
}
module.exports = {
  formatPath
};


