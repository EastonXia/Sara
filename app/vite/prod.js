const vite = require('vite');

const { baseConfig } = require('./config/vite.base.js');
const prodConfig = require('./config/vite.prod.js');

module.exports = async () => {
  console.log('[vite] building...');

  // 合并基础配置与生产配置
  const config = vite.mergeConfig(baseConfig, prodConfig);

  // configFile: false，避免业务项目根目录下的 vite.config.js 干扰 sara 的构建配置
  const result = await vite.build({ ...config, configFile: false });

  // build() 在单个配置下返回 RollupOutput，多 output 时返回数组
  const outputs = Array.isArray(result) ? result : [result];
  outputs.forEach((out) => {
    out.output.forEach((item) => {
      const size = item.type === 'chunk' ? Buffer.byteLength(item.code) : Buffer.byteLength(item.source);
      console.log(`[vite] ${item.fileName}  ${(size / 1024).toFixed(2)} kB`);
    });
  });

  console.log(`[vite] build done → ${config.build.outDir}`);
};
