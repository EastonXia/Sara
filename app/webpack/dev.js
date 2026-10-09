const express = require('express');
const path = require('path');
const consoler = require('consoler');
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');

module.exports = () => {
  // 从 webpack.dev.js 获取 webpack 配置和 devServer 配置
  const { webpackConfig, DEV_SERVER_CONFIG } = require('./config/webpack.dev.js');

  const app = express();
  const complier = webpack(webpackConfig);

  // 制定静态文件目录
  app.use(express.static(path.join(process.cwd(), './app/public/dist')))

  // 引用 devMiddleware 中间件（监控文件改动）
  app.use(devMiddleware(complier, {
    // 落地文件
    writeToDisk: (filePath) => filePath.endsWith('.tpl'),

    // 资源路径
    publicPath: webpackConfig.output.publicPath,

    // headers 配置
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': 'X-Requested-with, content-type, Authorization',
    },

    // 日志配置
    stats: {
      colors: true, // 多种颜色
      builtAt: true, // 打包时间
      depth: true, // 每个模块与入口文件的距离，
    }
  }))

  // 引用 hotMiddleware 中间件（实现热更新通讯）
  app.use(hotMiddleware(complier, {
    path: `/${DEV_SERVER_CONFIG.HMR_PATH}`,
    log: () => {}
  }))


  consoler.info('请等待 webpack 初次构建完成提示......');

  const port = DEV_SERVER_CONFIG.PORT;
  app.listen(port, () => {
    console.log(`app listening on port ${port}`)
  })
}


