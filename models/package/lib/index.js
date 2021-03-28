'use strict';
const path = require('path');
const pkgDir = require('pkg-dir').sync;
const pathExists = require("path-exists").sync;
const { formatPath } = require('@fri-cli/utils');

class Package {
  constructor(options = {}) {
    // const {
    //   storeDir = '',
    //   npmName = '',
    //   npmVersion = '',
    //   targetPath = '',
    // } = options;
    ['storeDir', 'npmName', 'npmVersion', 'targetPath'].forEach(v => {
      this[v] = options[v] || '';
    });
    
  }
  prepare() {

  }
  
  exists() {

  }

  install() {

  }

  update() {

  }

  getNpmRootFile() {
    if (!this.storeDir) {
      return this._getNpmRootFile(this.targetPath);
    }
  }

  _getNpmRootFile(pathPk) {
    if (!pathPk || !pathExists(pathPk)) return '';
  
    const rootPath = pkgDir(pathPk);
    const pkInfo = require(path.resolve(rootPath, 'package.json'));
    return pkInfo && pkInfo.main ? formatPath(path.resolve(rootPath, pkInfo.main)) : '';
  }
}

module.exports = Package;