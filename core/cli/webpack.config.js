const path = require('path');
module.exports = {
    entry: './bin/core.js', // 入口文件
    mode: 'development', // 开发模式，development => 
    // production =》 生产模式
  output: {
      // 输出
        path: path.join(__dirname, '/dist'), // 输出目录
    filename: 'core.js',// 输出的文件名
    },
    target: 'node', // 默认web，因为需要使用到node原生模块，所以需要更改为node
    module: {
        rules: [{ // 配置babel-loader
        test: /\.js$/, // 处理js
        exclude: /(node_modules|dist)/, // 排除node_modules和dist目录
        use: {
          loader: 'babel-loader', // 使用babel对js进行低版本兼容处理
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              [
                '@babel/plugin-transform-runtime',
                {
                  'corejs': 3,
                  'regenerator': true,
                  "useESModules": true,
                  'helpers': true
                }
              ]
            ]
          }
        }
        }]
    }
}