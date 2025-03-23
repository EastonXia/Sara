const glob = require('glob');
const path = require('path');
const { sep } = path;

/**
 * extend loader
 * @param {*} app Koa实例
 * 
 * 加载所有 extend ，可通过 ‘app.extend.${文件}访问’
 * 
 *  例子：
 *  app/extend
 *    ｜
 *    ｜ -- custom-extend.js
 *            ｜
 *            ｜ 
 * 
 *  => app.extend.customExtend
 * 
 */
module.exports = (app) => {
  // 读取 elpis 内部 app/extend/**.js 下的所有文件
  const elpisExtendPath = path.resolve(__dirname, `..${sep}..${sep}app${sep}extend`);
  const elpisFileList = glob.sync(path.resolve(elpisExtendPath, `.${sep}**${sep}**.js`));
  elpisFileList.forEach((file) => {
    handleFile(file)
  })

  // 读取 业务根目录 app/extend/**.js 下的所有文件
  const businessExtendPath = path.resolve(app.businessPath, `.${sep}extend`);
  const businessFileList = glob.sync(path.resolve(businessExtendPath, `.${sep}**${sep}**.js`));
  businessFileList.forEach((file) => {
    handleFile(file)
  })


  // 遍历所有文件目录，把内容加载到 app.extend 下
  function handleFile(file) {
    // 提取文件名称
    let name = path.resolve(file);

    // 截取路径名称 app/extend/custom-extend.js => custom-extend
    name = name.substring(name.lastIndexOf(`extend${sep}`) + `extend${sep}`.length, name.lastIndexOf('.'))

    // 把 ‘-’ 改成驼峰命名，custom-extend.js => customExtend
    name = name.replace(/[_-][a-z]/ig, (s) => s.substring(1).toUpperCase());

    // 过滤 app 已经存在的 key
    for (const key in app) {
      if(key === name) {
        console.log(`[extend load error] name:${name} is already in app`);
        return;
      }
    }
 
    // 挂在 extend 到 app 上
    app[name] = require(path.resolve(file))(app);
  }
};