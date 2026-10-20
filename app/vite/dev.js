const vite = require('vite');

const { baseConfig } = require('./config/vite.base.js');
const devConfig = require('./config/vite.dev.js');

module.exports = async () => {
  // 合并基础配置与开发配置
  const config = vite.mergeConfig(baseConfig, devConfig);

  // configFile: false，避免业务项目根目录下的 vite.config.js 干扰 sara 的构建配置
  const server = await vite.createServer({ ...config, configFile: false });
  await server.listen();

  const { port } = server.config.server;
  console.log(`[vite] dev server listening on http://127.0.0.1:${port}`);
};
