const superAgent = require('superagent');

module.exports = (app) => {
  return class baseService {
    /**
     * service 基类
     * 统一收拢 service 相关的公共方法
     * 
     */
    constructor() {
      this.app = app;
      this.config = app.config;
      this.curl = superAgent;
    }

  }
}