<a name="TXXxu"></a>
### 工具
- vscode： 代码编辑器



<a name="iNlKC"></a>
### 命令概览
![image.png](https://cdn.nlark.com/yuque/0/2021/png/825673/1624954274895-7ac837cc-9d87-4f21-afc3-c8e654609a2a.png#clientId=uded3b188-f1c8-4&from=paste&height=238&id=u5cd17423&margin=%5Bobject%20Object%5D&name=image.png&originHeight=238&originWidth=594&originalType=binary&ratio=1&size=12803&status=done&style=none&taskId=u0bc78529-507a-4f1e-915d-7b3aaca913b&width=594)
<a name="s4VtO"></a>
#### 安装 vue-cli
```powershell
npm install -g @fri-cli/core

OR

yarn global add @fri-cli/core
```
<br />在安装 fri-cli 之后，执行 fri 命令，就可以得到上面图片中的内容，从这个图片中可以看出，目前有 4个选项和2 种命令。<br />选项：
```powershell
选项:
  -V, --version                  获取fri-cli版本
  -d, --debug                    输出命令运行的调试信息
  -tp, --target_path <path>      初始化的执行NPM包目录
  -h, --help                     display help for command
```
命令：

- init
```powershell
使用: fri init [options] [project-name]

项目初始化命令

Options:
  -f, --force  是否强制初始化项目
  -h, --help   display help for command
  -tp --target_path 自定义初始化npm包目录
```

- help

​<br />
<a name="Tir0N"></a>
### 常见 npm 包

- [commander](https://www.npmjs.com/package/commander)：The complete solution for [node.js](http://nodejs.org/) command-line interfaces.。
- [Inquirer](https://www.npmjs.com/package/inquirer)：A collection of common interactive command line user interfaces。
- [colors](https://www.npmjs.com/package/colors)： get colors in your node.js console
- [npmlog](https://www.npmjs.com/package/npmlog): The logger util that npm uses.
- [path-exists](https://www.npmjs.com/package/path-exists): Check if a path exists
- [semver](https://www.npmjs.com/package/semver):  The semantic versioner for npm
