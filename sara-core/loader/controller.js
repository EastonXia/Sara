const glob = require('glob');
const path = require('path');
const { sep } = path;

/**
 * controller loader
 * @param {*} app Koa实例
 * 
 * 加载所有controller，可通过 ‘app.controller.${目录}.${文件}访问’
 * 
 *  例子：
 *  app/controller
 *    ｜
 *    ｜ -- custom-module
 *            ｜
 *            ｜ -- custom-controller.js
 * 
 *  => app.controller.customModule.customController
 * 
 */
module.exports = (app) => {
  const controller = {}

  // 读取 elpis 内部 app/controller/**/**.js 下的所有文件
  const elpisControllerPath = path.resolve(__dirname, `..${sep}..${sep}/app${sep}controller`);
  const elpisFileList = glob.sync(path.resolve(elpisControllerPath, `.${sep}**${sep}**.js`));
  elpisFileList.forEach((file) => {
    handleFile(file)
  })

  // 读取 业务根目录 app/controller/**/**.js 下的所有文件
  const businessControllerPath = path.resolve(app.businessPath, `.${sep}controller`);
  const businessFileList = glob.sync(path.resolve(businessControllerPath, `.${sep}**${sep}**.js`));
  businessFileList.forEach((file) => {
    handleFile(file)
  })

  // 遍历所有文件目录，把内容加载到 app.controller下
  function handleFile(file) {
    // 提取文件名称
    let name = path.resolve(file);

    // 截取路径名称 app/controller/custom-module/custom-controller.js => custom-module/custom-controller
    name = name.substring(name.lastIndexOf(`controller${sep}`) + `controller${sep}`.length, name.lastIndexOf('.'));

    // 把 ‘-’ 改成驼峰命名，custom-module/custom-controller.js => customModule/customController
    name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

    // 挂载 controller 到内存对象 app 中
    let tempController = controller;
    const names = name.split(sep);
    for(let i = 0, len = names.length; i < len ; ++i) {
      if(i === len - 1) { // 文件
        const ControllerModule = require(path.resolve(file))(app);
        tempController[names[i]] = new ControllerModule();
      } else { // 文件夹
        if(!tempController[names[i]]) {
          tempController[names[i]] = {};
        }
        tempController =  tempController[names[i]];
      }
    }
  }

  app.controller = controller;

};