const glob = require('glob');
const path = require('path');
const { sep } = path;

/**
 * middleware loader
 * @param {*} app Koa实例
 * 
 * 通过 ‘json-schema & ajv’ 对 API 规则进行约束，配合 api-params-verify 中间件使用
 * 
 * app/router-schema/**.js
 *  
 * 输出：
 * app.routercSchema = {
 *  '${api1}': ${jsonSchema},
 *  '${api2}': ${jsonSchema},
 *  '${api3}': ${jsonSchema},
 * }
 * 
 */
module.exports = (app) => {
  
  let routerSchema = {};

  // 读取 elpis 内部 app/router-schema/**/**.js 下的所有文件
  const elpisRouterSchemaPath = path.resolve(__dirname, `..${sep}..${sep}app${sep}router-schema`);
  const elpisFileList = glob.sync(path.resolve(elpisRouterSchemaPath, `.${sep}**${sep}**.js`));
  elpisFileList.forEach((file) => {
    handleFile(file)
  })


  // 读取 业务根目录 app/router-schema/**/**.js 下的所有文件
  const businessRouterSchemaPath = path.resolve(app.businessPath, `.${sep}router-schema`);
  const businessFileList = glob.sync(path.resolve(businessRouterSchemaPath, `.${sep}**${sep}**.js`));
  businessFileList.forEach((file) => {
    handleFile(file)
  })

  // 注册所有 routerSchema ,使得可以 ‘app,routerSchema’ 这样访问
  function handleFile(file) {
    routerSchema = {
      ...routerSchema,
      ...require(path.resolve(file)),
    }
  }

  app.routerSchema = routerSchema;
};