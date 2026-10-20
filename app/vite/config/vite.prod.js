const path = require('path');

// 生产阶段配置：产物输出到 app/public/dist/prod（与 webpack 一致）
module.exports = {
  // 公共路径：与 webpack publicPath 对齐。Vite 运行时（__vitePreload 等）拼接的 css/js 地址
  // 都以它为前缀，否则会变成 /css/xxx.css，被 8080 兜底路由 302
  base: '/dist/prod/',

  build: {
    outDir: path.resolve(process.cwd(), 'app/public/dist/prod'),
    rollupOptions: {
      output: {
        // 与 webpack splitChunks 的 vendor / common 分组对齐
        manualChunks(id) {
          if (/node_modules/.test(id)) {
            return 'vendor';
          }
          if (/common|widgets/.test(id)) {
            return 'common';
          }
          return undefined;
        },

        // 产物目录与 webpack 对齐：js/ 与 css/，而不是 Vite 默认的 assets/
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames(assetInfo) {
          // Rollup 4 的 names 为数组，name 已废弃，两者都兼容
          const names = assetInfo.names || [assetInfo.name || ''];
          const isCss = names.some((n) => n && n.endsWith('.css'));
          return isCss ? 'css/[name]-[hash][extname]' : 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  esbuild: {
    // 生产环境去掉 console 与 debugger（webpack 侧仅 drop_console）
    drop: ['console', 'debugger'],
  },
};
