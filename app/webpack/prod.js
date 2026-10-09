const webpack = require('webpack');
const webProdConfig = require('./config/webpack.prod.js');

module.exports = () => {
  console.log('\nbuilding... \n');

  // 调用 webpack 启动方法，启动 webpack 打包
  webpack(webProdConfig, (err, stats) => {
    if (err) { 
      console.log('err: ', err);
      return;
    }
    process.stdout.write(`${stats.toString({
      colors: true, // 在控制台输出色彩信息
      modules: false, // 不显示每个模块的打包信息
      children: false, // 不显示子编译任务
      chunks: false, // 不显示每个代码块的信息
      chunkModules: true, // 显示代码块中模块的信息
      builtAt: true, // 打包时间
    })}\n`)
  });
}
