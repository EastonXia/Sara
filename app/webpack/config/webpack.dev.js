const path = require('path');
const merge  = require('webpack-merge');

// 基类配置
const baseConfig = require('./webpack.base');
const { HotModuleReplacementPlugin } = require('webpack');

// devServer 配置
const DEV_SERVER_CONFIG = {
  HOST: '127.0.0.1',
  PORT: 9002,
  HMR_PATH: '__webpack_hmr',
  TIMEOUT: 20000,
}
const DEV_IP = `http://${DEV_SERVER_CONFIG.HOST}:${DEV_SERVER_CONFIG.PORT}`;
const DEV_PATH = `/${DEV_SERVER_CONFIG.HMR_PATH}`;
const DEV_PARAMS = `?timeout=${DEV_SERVER_CONFIG.TIMEOUT}&reload=true`;

// 开发阶段的 entry 配置需要加入 hmr 
Object.keys(baseConfig.entry).forEach((v) => {
  // 第三方包不作为 hmr 入口
  if(v !== 'vendor') {
    baseConfig.entry[v] = [
      // 主入口文件
      baseConfig.entry[v],
      // hmr 更新入口，官方指定的 hmr 路径
      `${require.resolve('webpack-hot-middleware/client')}?path=${DEV_IP}${DEV_PATH}${DEV_PARAMS}`
    ]
  }
})

const webpackConfig = merge.smart(baseConfig, {
  // 指定开发环境
  mode: 'development',

  // source-map 开发工具，呈现代码的映射关系，便于在开发过程中调试代码
  devtool: 'eval-cheap-module-source-map',

  // 开发环境的 output 配置
  output: {
    filename: 'js/[name]_[chunkhash:8].bundle.js',
    path: path.resolve(process.cwd(), './app/public/dist/dev/'), //  输出文件存储路径
    publicPath: `${DEV_IP}/public/dist/dev`, // 外部资源公共路径
    globalObject: 'this', // 兼容 devServer 的 node 环境，还有浏览器环境
  },

  // 开发阶段插件
  plugins: [
    // HotModuleReplacementPlugin 用于实现热模块替换
    // 模块热替换允许在应用程序运行时替换模块
    // 极大的提升开发效率，因为能让应用程序一直保持运行状态
    new HotModuleReplacementPlugin({
      // multiStep: false, // webpack5 该配置项已被移除
    })
  ]
})


module.exports = {
  // webpack 配置
  webpackConfig,

  // devServer 配置，暴露给 dev.js 使用
  DEV_SERVER_CONFIG
};