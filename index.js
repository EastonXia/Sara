// 引入 sara-core
const saraCore = require('./sara-core');

// 引入 前端工程化构建方法
const FEBuildDev = require('./app/webpack/dev.js');
const FEBuildProd = require('./app/webpack/prod.js');

module.exports = {
  /**
   * 启动 sara
   * @param {*} options sara 项目配置，透传到 sara-core
   * @returns 
   */
  serverStart(options = {}) {
    const app = saraCore.start(options)
    return app;
  },

  /**
   * 编译构建前端工程
   * @param {*} env 环境变量 dev/prod
   */
  frontendBuild(env) {
    if(env === 'local') {
      FEBuildDev()
    } else if (env === 'prod') {
      FEBuildProd()
    }
  },

  /**
   * 服务端基础
   */
  Controller: {
    Base: require('./app/controller/base.js'),
  },
  Service: {
    Base: require('./app/service/base.js'),
  }
}

