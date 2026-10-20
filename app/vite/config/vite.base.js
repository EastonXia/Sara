const fs = require('fs');
const path = require('path');
const glob = require('glob');
const vue = require('@vitejs/plugin-vue');
const saraTplPlugin = require('../plugins/sara-tpl-plugin.js');

// 入口表：entryName -> 绝对路径
const allEntries = {};

// 不存在的业务扩展文件统一指向空模块
const blankModulePath = path.resolve(__dirname, '../libs/blank.js');

/**
 * 把单个入口文件登记进入口表
 * entryName 取文件名（去掉 .js），与 webpack 的 handleFile 保持一致
 */
function handleFile(file, entries = {}) {
  const entryName = path.basename(file, '.js');
  entries[entryName] = file;
}

/**
 * 扫描两棵树的 entry.*.js，合并到 allEntries
 * 1. 框架：app/pages（__dirname 为 app/vite/config，与 webpack 同深度）
 * 2. 业务：cwd/app/pages，同名时后扫描的业务覆盖框架（同 webpack Object.assign 语义）
 */
function scanEntries() {
  const saraEntries = {};
  const businessEntries = {};

  const saraEntryGlob = path.resolve(__dirname, '../../pages/**/entry.*.js');
  glob.sync(saraEntryGlob).forEach((file) => {
    handleFile(file, saraEntries);
  });

  const businessEntryGlob = path.resolve(process.cwd(), './app/pages/**/entry.*.js');
  glob.sync(businessEntryGlob).forEach((file) => {
    handleFile(file, businessEntries);
  });

  Object.assign(allEntries, saraEntries, businessEntries);
  return allEntries;
}

/**
 * 业务扩展文件 alias：存在则指向业务文件，否则指向 blank
 */
function businessAlias(relativePath) {
  const businessFile = path.resolve(process.cwd(), relativePath);
  return fs.existsSync(businessFile) ? businessFile : blankModulePath;
}

/**
 * 构造 alias，与 webpack.base.js 的 resolve.alias 一一对应
 */
function buildAlias() {
  return {
    'vue': require.resolve('vue'),
    '@babel/runtime/helpers/asyncToGenerator': require.resolve('@babel/runtime/helpers/asyncToGenerator'),
    '@babel/runtime/regenerator': require.resolve('@babel/runtime/regenerator'),

    '$saraPages': path.resolve(__dirname, '../../pages'),
    '$saraCommon': path.resolve(__dirname, '../../pages/common'),
    '$saraCurl': path.resolve(__dirname, '../../pages/common/curl.js'),
    '$saraUtils': path.resolve(__dirname, '../../pages/common/utils.js'),
    '$saraWidgets': path.resolve(__dirname, '../../pages/widgets'),
    '$saraHeaderContainer': path.resolve(__dirname, '../../pages/widgets/header-container/header-container.vue'),
    '$saraSiderContainer': path.resolve(__dirname, '../../pages/widgets/sider-container/sider-container.vue'),
    '$saraSchemaTable': path.resolve(__dirname, '../../pages/widgets/schema-table/schema-table.vue'),
    '$saraSchemaForm': path.resolve(__dirname, '../../pages/widgets/schema-form/schema-form.vue'),
    '$saraSchemaSearchBar': path.resolve(__dirname, '../../pages/widgets/schema-search-bar/schema-search-bar.vue'),
    '$saraStore': path.resolve(__dirname, '../../pages/store'),
    '$saraBoot': path.resolve(__dirname, '../../pages/boot.js'),

    // 业务扩展（不存在则 fallback 到 blank）
    '$businessDashboardRouterConfig': businessAlias('./app/pages/dashboard/router.js'),
    '$businessComponentConfig': businessAlias('./app/pages/dashboard/complex-view/schema-view/components/component-config.js'),
    '$businessFormItemConfig': businessAlias('./app/pages/widgets/schema-form/form-item-config.js'),
    '$businessSearchItemConfig': businessAlias('./app/pages/widgets/schema-search-bar/search-item-config.js'),
    '$businessHeaderConfig': businessAlias('./app/pages/widgets/header-container/header-config.js'),
  };
}

scanEntries();

const baseConfig = {
  build: {
    rollupOptions: {
      input: allEntries,
    },
  },
  resolve: {
    extensions: ['.js', '.vue', '.less', '.css', '.json'],
    dedupe: ['vue'],
    alias: buildAlias(),
  },
  plugins: [vue(), saraTplPlugin()],
  css: {
    // 与 webpack 的 less-loader 一致：不传额外选项，使用 less 默认配置
    preprocessorOptions: {
      less: {},
    },
  },
};

module.exports = {
  allEntries,
  baseConfig,
};
