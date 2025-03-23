const Koa = require('koa');
const path = require('path');
const { sep } = path // 兼容不用操作系统上的斜杠

const env = require('./env');

const middlewareLoader = require('./loader/middleware');
const routerSchemaLoader = require('./loader/router-schema');
const controllerLoader = require('./loader/controller');
const serviceLoader = require('./loader/service');
const configLoader = require('./loader/config');
const extendLoader = require('./loader/extend');
const routerLoader = require('./loader/router');

module.exports = {
  /**
   * 启动项目
   * @param {*} options  项目配置
   *  options = {
   *    name // 项目名称
   *    homePage // 首页名称
   * }
   */
  start(options = {}) {
    // koa 实例
    const app = new Koa();

    // 应用配置
    app.options = options; 
  
    // 基础路径
    app.baseDir = process.cwd();

    // 业务文件路径
    app.businessPath = path.resolve(app.baseDir, `.${sep}app`);

    // 初始化环境配置
    app.env = env();
    console.log(`-- [start] env: ${app.env.get()} --`);

    // 加载 middleware
    middlewareLoader(app);
    console.log(`-- [start] load middlewares done --`);

    // 加载routerSchema
    routerSchemaLoader(app);
    console.log(`-- [start] load routerSchema done --`);

    //加载controller
    controllerLoader(app);
    console.log(`-- [start] load controller done --`);

    // 加载service
    serviceLoader(app);
    console.log(`-- [start] load service done --`);

    // 加载config
    configLoader(app);
    console.log(`-- [start] load config done --`);

    // 加载extend
    extendLoader(app);
    console.log(`-- [start] load extend done --`);

    // 注册 elpis 全局中间件 默认写在 app/middleware.js
    const elpisMiddlewarePath = path.resolve(__dirname, `..${sep}app${sep}middleware.js`)
    const elpisMiddleware = require(elpisMiddlewarePath);
    elpisMiddleware(app);
    console.log(`-- [start] load global middleware done --`);

    // 注册业务全局中间件（用户引用外部的中间件）默认写在 app/middleware.js
    try {
      require(`${app.businessPath}${sep}middleware.js`)(app);
      console.log(`-- [start] load global business middleware done --`);
    } catch (error) {
      console.log('[exception] there is no global business middleware file.');
    }

    // 加载router
    routerLoader(app);
    console.log(`-- [start] load router done --`);

    // 启动服务
    try {
      const port = process.env.PORT || 8080;
      const host = process.env.IP || '0.0.0.0';
      app.listen(port, host);
      console.log(`Server running on port: ${port}`)
    } catch (error) {
      console.log(e);
    }

    return app;
  }
}

