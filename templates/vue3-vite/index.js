'use strict';
const fsExtra = require('fs-extra');
const glob = require('glob');
const ejs = require('ejs');

function ejsRender(options, projectInfo) {
  return new Promise((resolve1, reject1) => {
    glob('**', options, (er, files) => {
      if (er) reject1(er);

      const {
        projectName: className,
        version,
        description,
      } = projectInfo;
      const data = { className, version, description };

      const options = {};
      Promise.all(
        files.map((file) => {
          return new Promise((resolve2, reject2) => {
            const filename = require('path').resolve(process.cwd(), file);
            ejs.renderFile(filename, data, options, function (err, str) {
              if (err) {
                reject2(err);
              } else {
                if (str) fsExtra.writeFileSync(filename, str);
                resolve2(str);
              }
            });
          });
        })
      )
        .then((result) => {
          resolve1(result);
        })
        .catch((error) => {
          reject1(error);
        });
    });
  });
}
/**
 * 
 * @param {*} targetPath 
 * @param {string} template templatePath
 */
async function install ({ targetPath, template, projectInfo, ignore = [] }) {
  let err;
  try {
    // 3.1.1 下载的模版缓存目录，复制文件的目录，确保存在
    fsExtra.ensureDirSync(targetPath);
    fsExtra.ensureDirSync(template);
    // 3.1.2 复制文件过去
    fsExtra.copySync(template, targetPath);
    // 3.1.3 glob匹配文件ejs 渲染保存
    const globOptions = {
      cwd: targetPath,
      // 要设置成动态
      ignore: ['**/public/**', '**/node_modules/**'].concat(ignore),
      nodir: true,
    };
    await ejsRender(globOptions, projectInfo);
  } catch (error) {
    err = error;
  } finally {
    if (err) throw err;
  }
}
module.exports = install;
