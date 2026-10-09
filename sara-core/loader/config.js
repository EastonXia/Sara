const path = require('path');
const { sep } = path;

/**
 * config loader
 * @param {*} app koa 实例 
 * 
 * 配置区分 本地/测试/生产，通过 env 环境读取不同文件配置 env.config
 * 通过 env.config 覆盖 default.config 加载到 app.config 中，
 * 
 * 目录下对应的 config 配置
 * 默认配置 config/config.default.js
 * 本地配置 config/config.local.js
 * 测试配置 config/config.beta.js
 * 生产配置 config/config.prod.js
 * 
 */
module.exports = (app) => {
  // elpis config 目录及相关文件
  const elpisConfigPath = path.resolve(__dirname, `..${sep}..${sep}config`);
  let defaultConfig = require(path.resolve(elpisConfigPath, `.${sep}config.default.js`))

  // 找到业务 config 目录及相关文件
  const businessConfigPath = path.resolve(app.businessPath, `.${sep}config`);
  try {
    defaultConfig = {
      ...defaultConfig,
      ...require(path.resolve(businessConfigPath, `.${sep}config.default.js`))
    }
  } catch(error) {
    console.log('[exception] config.default file exception');
  }
 
  // 获取 env.config
  let envConfig = {};
  try {
    if(app.env.isLocal()) {
      envConfig = require(path.resolve(businessConfigPath, `.${sep}config.local.js`));
    } else if(app.env.isBeta()) {
      envConfig = require(path.resolve(businessConfigPath, `.${sep}config.beta.js`));
    } else if(app.env.isProduction()) {
      envConfig = require(path.resolve(businessConfigPath, `.${sep}config.prod.js`));
    }
  } catch (error) {
    console.log('[exception] config.env file exception');
  }

  // 覆盖并加载 config 配置
  app.config = Object.assign({}, defaultConfig, envConfig);
  
};