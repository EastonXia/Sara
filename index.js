// 引入 Nest 启动入口（需先 npm run build 生成 dist）
const { bootstrap } = require('./dist/main');

// 引入 前端工程化构建方法
const FEBuildDev = require('./app/vite/dev.js');
const FEBuildProd = require('./app/vite/prod.js');

module.exports = {
  /**
   * 启动 sara
   * @param {*} options sara 项目配置，透传到 BOOTSTRAP_OPTIONS
   * @returns
   */
  serverStart(options = {}) {
    return bootstrap(options);
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
}
