"use strict";

const urlJoin = require("url-join");
const axios = require("axios");
const semver = require("semver");

function getNpmInfo(npmName, isOriginalRegistry = false) {
  const registryUrl = getRegistryUrl(isOriginalRegistry);
  const url = urlJoin(registryUrl, npmName);
  return axios.get(url).then(res => {
    if (res.status === 200) {
      return res.data;
    }
    return null;
  }).catch(err => {
    return Promise.reject(err);
  });
}

function getRegistryUrl(isOriginal = false) {
  return isOriginal
    ? "http://registry.npmjs.org"
    : "https://registry.npm.taobao.org";
}

// 获取npm versions
async function getNpmVersions(npmName, isOriginalRegistry = false) {
  const data = await getNpmInfo(npmName, isOriginalRegistry);
  if (!data) return null;
  const versions = Object.keys(data.versions).sort((a, b) => semver.gte(b, a) || -1);
  return versions;
}

// 获取满足条件的NPM版本 测试云服务器lerna
async function getNpmSemverVersions(npmName, baseVersion, isOriginalRegistry = false) {
  const versions = await getNpmVersions(npmName, isOriginalRegistry);
  if (!versions) return null;
  const arr = versions.filter(v => semver.satisfies(v, `>${baseVersion}`));
  return arr.length ? arr : null;
}

// 获取NPM包最新版本
async function getNpmLatestVersion(npmName, isOriginalRegistry = false) {
  const versions = await getNpmVersions(npmName, isOriginalRegistry);
  return !versions ? null : versions[0];
}
module.exports = {
  getNpmInfo,
  getNpmVersions,
  getNpmSemverVersions,
  getNpmLatestVersion,
  getRegistryUrl
};