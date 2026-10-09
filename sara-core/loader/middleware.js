const glob = require('glob');
const path = require('path');
const { sep } = path;

/**
 * middleware loader
 * @param {*} app Koa实例
 * 
 * 加载所有middle，可通过 ‘app.middlewares.${目录}.${文件}访问’
 * 
 *  例子：
 *  app/middlewares
 *    ｜
 *    ｜ -- custom-module
 *            ｜
 *            ｜ -- custom-middleware.js
 * 
 *  => app.middlewares.customModule.customMiddleware
 * 
 */
module.exports = (app) => {
  const middlewares = {}

  // 读取 elpis 内部 app/middlewares/**/**.js 下的所有文件
  const elpisMiddlewarePath = path.resolve(__dirname, `..${sep}..${sep}app${sep}middlewares`);
  const elpisFileList = glob.sync(path.resolve(elpisMiddlewarePath, `.${sep}**${sep}**.js`));
  elpisFileList.forEach((file) => {
    handleFile(file)
  })

  // 读取 业务根目录 app/middlewares/**/**.js 下的所有文件
  const businessMiddlewarePath = path.resolve(app.businessPath, `.${sep}middlewares`);
  const businessFileList = glob.sync(path.resolve(businessMiddlewarePath, `.${sep}**${sep}**.js`));
  businessFileList.forEach((file) => {
    handleFile(file)
  })

  // 遍历所有文件目录，把内容加载到 app.middlewares下 
  function handleFile(file) {
    // 提取文件名称
    let name = path.resolve(file);

    // 截取路径名称 app/middlewares/custom-module/custom-middleware.js => custom-module/custom-middleware
    name = name.substring(name.lastIndexOf(`middlewares${sep}`) + `middlewares${sep}`.length, name.lastIndexOf('.'));

    // 把 ‘-’ 改成驼峰命名，custom-module/custom-middleware.js => customModule.customMiddleware
    name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

    // 挂载 middleware 到内存对象 app 中
    let tempMiddleware = middlewares;
    const names = name.split(sep);
    for(let i = 0, len = names.length; i < len; ++i) {
      if(i === len - 1) {
        tempMiddleware[names[i]] = require(path.resolve(file))(app);
      } else {
        if(!tempMiddleware[names[i]]) {
          tempMiddleware[names[i]] = {};
        }
        tempMiddleware =  tempMiddleware[names[i]];
      }
    }
  }
  
  app.middlewares = middlewares;
};