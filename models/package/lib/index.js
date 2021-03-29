'use strict';
const path = require('path');
const pkgDir = require('pkg-dir').sync;
const pathExists = require("path-exists").sync;
const npminstall = require('npminstall');
const mkdirp = require('mkdirp').sync;
const { formatPath } = require('@fri-cli/utils');
const { getNpmLatestVersion, getRegistryUrl } = require('@fri-cli/get-npm-info');

class Package {

  constructor(options = {}) {
    ['storeDir', 'npmName', 'npmVersion', 'targetPath'].forEach(v => {
      this[v] = options[v] || '';
    });
    this.cacheFilePathPrefix = this.npmName.replace('/', '_');
  }

  // 获取包存在的缓存路径
  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.npmVersion}@${this.npmName}`);
  }

  async prepare() {
    if (this.npmVersion === 'latest') {
      const ver = await getNpmLatestVersion(this.npmName);
      if (ver) this.npmVersion = ver;
    }
  }
  
  async exists() {
    await this.prepare();
    return pathExists(this.cacheFilePath);
  }

  async install() {
    await this.prepare();
    await this.installSpecVersion(this.npmVersion);
  }

  async installSpecVersion (version) {
    console.log(version, this.storeDir);
    mkdirp(this.storeDir);
    await npminstall({
      root: this.targetPath,
      pkgs: [
        { name: this.npmName, version: version },
      ],
      registry: getRegistryUrl(),
      storeDir: this.storeDir,
    });
  }

  async update() {
    const latestVersion = await getNpmLatestVersion(this.npmName);
    if (latestVersion === this.npmVersion) return;
    await this.installSpecVersion(latestVersion);
    this.npmVersion = latestVersion;
  }

  getNpmRootFile() {
    const filePath = !this.storeDir ? this.targetPath : this.cacheFilePath;
    return this._getNpmRootFile(filePath);
  }

  _getNpmRootFile (pathPk) {
    console.log(pathPk, pathExists(pathPk));
    if (!pathPk || !pathExists(pathPk)) return '';
  
    const rootPath = pkgDir(pathPk);
    const pkInfo = require(path.resolve(rootPath, 'package.json'));
    return pkInfo && pkInfo.main ? formatPath(path.resolve(rootPath, pkInfo.main)) : '';
  }
}

module.exports = Package;