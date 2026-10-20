const fs = require('fs');
const path = require('path');

// dev 资源地址：绝对 URL，对齐 webpack dev publicPath。8080 渲染 .tpl 时必须指向 9002
const DEV = 'http://127.0.0.1:9002';

// prod 资源地址：对齐 webpack prod publicPath（'/dist/prod/'），与 vite outDir 的相对路径拼接
const PROD_BASE = '/dist/prod';

// 母版：与 webpack HtmlWebpackPlugin 的 template 为同一文件
const TEMPLATE_PATH = path.resolve(__dirname, '../../view/entry.tpl');

/**
 * 把入口文件的绝对路径转换为 Vite dev 服务中的模块路径（统一使用正斜杠）
 * 在 server root 内 → /相对路径；在 root 之外（如 npm link 的框架目录）→ /@fs/绝对路径
 * 注意：不能写成 ../xxx 这种相对路径，浏览器会把 /../ 归一化掉，导致 404
 */
function toModuleUrl(root, file) {
  const rel = path.relative(root, file);
  if (rel && !rel.startsWith('..') && !path.isAbsolute(rel)) {
    return `/${rel.split(path.sep).join('/')}`;
  }
  const absolute = file.split(path.sep).join('/').replace(/^\//, '');
  return `/@fs/${absolute}`;
}

/**
 * 把 dev 脚本注入母版 </body> 之前（与 HtmlWebpackPlugin 默认 inject: body 行为一致）
 */
function injectScripts(template, scripts) {
  if (!template.includes('</body>')) {
    throw new Error('[sara-tpl-plugin] 母版缺少 </body>，无法注入 dev 脚本');
  }
  return template.replace('</body>', `${scripts}\n  </body>`);
}

/**
 * 把 prod 样式注入母版 </head> 之前
 */
function injectHead(template, links) {
  if (!links) {
    return template;
  }
  if (!template.includes('</head>')) {
    throw new Error('[sara-tpl-plugin] 母版缺少 </head>，无法注入 prod 样式');
  }
  return template.replace('</head>', `${links}\n  </head>`);
}

/**
 * 收集入口 chunk 及其静态依赖 chunk 上的 css（递归、去重）
 * viteMetadata.importedCss 只记录该 chunk 自身引入的样式，必须沿 imports 向下合并
 */
function collectCss(chunk, bundle, seen = new Set(), out = new Set()) {
  if (seen.has(chunk.fileName)) {
    return out;
  }
  seen.add(chunk.fileName);

  if (chunk.viteMetadata && chunk.viteMetadata.importedCss) {
    chunk.viteMetadata.importedCss.forEach((css) => out.add(css));
  }
  chunk.imports.forEach((name) => {
    const dep = bundle[name];
    if (dep && dep.type === 'chunk') {
      collectCss(dep, bundle, seen, out);
    }
  });
  return out;
}

module.exports = function saraTplPlugin() {
  return {
    name: 'sara-tpl-plugin',

    configureServer(server) {
      // 延迟 require：vite.base.js 会 require 本插件，顶层 require 会拿到未初始化的 exports
      const { allEntries } = require('../config/vite.base.js');

      const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
      const outDir = path.resolve(process.cwd(), './app/public/dist');
      fs.mkdirSync(outDir, { recursive: true });

      Object.keys(allEntries).forEach((entryName) => {
        const moduleUrl = toModuleUrl(server.config.root, allEntries[entryName]);
        const scripts = [
          `<script type="module" src="${DEV}/@vite/client"></script>`,
          `<script type="module" src="${DEV}${moduleUrl}"></script>`,
        ].join('\n    ');

        fs.writeFileSync(
          path.join(outDir, `${entryName}.tpl`),
          injectScripts(template, scripts),
        );
      });
    },

    generateBundle(options, bundle) {
      // 延迟 require，原因同 configureServer
      const { allEntries } = require('../config/vite.base.js');

      const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
      const outDir = path.resolve(process.cwd(), './app/public/dist');
      fs.mkdirSync(outDir, { recursive: true });

      const chunks = Object.values(bundle);

      Object.keys(allEntries).forEach((entryName) => {
        // 入口 chunk 的 name 即 input 的 key，比 facadeModuleId 稳定（不受符号链接影响）
        const entryChunk = chunks.find(
          (c) => c.type === 'chunk' && c.isEntry && c.name === entryName,
        );
        if (!entryChunk) {
          throw new Error(`[sara-tpl-plugin] 未找到入口 chunk: ${entryName}`);
        }

        // 入口 chunk 是 ES module，浏览器加载它时会按静态 import 自动拉取依赖 chunk，只需注入入口脚本
        const links = [...collectCss(entryChunk, bundle)]
          .map((css) => `<link rel="stylesheet" href="${PROD_BASE}/${css}">`)
          .join('\n    ');
        const script = `<script type="module" src="${PROD_BASE}/${entryChunk.fileName}" crossorigin></script>`;

        const html = injectScripts(injectHead(template, links), script);
        fs.writeFileSync(path.join(outDir, `${entryName}.tpl`), html);
      });
    },
  };
};
