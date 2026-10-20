const path = require('path');

// 开发阶段配置：对齐 webpack dev 的 9002 端口
module.exports = {
  server: {
    host: '0.0.0.0',
    port: 9002,
    cors: true,
    hmr: true,

    // 放行框架包根（本文件在 app/vite/config，上三级即框架包根）与 cwd（demo 根）
    // 否则 /@fs 访问框架目录会被 Vite 以 403 拒绝
    fs: {
      allow: [process.cwd(), path.resolve(__dirname, '../../..')],
    },

    // 固定 dev 资源的 origin，避免 CSS/图片的相对地址被解析成 /@fs 打到 8080
    origin: 'http://127.0.0.1:9002',
  },
};
