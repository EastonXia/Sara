const path = require('path');
const webpack = require('webpack');
const glob = require('glob');
const fs = require('fs');
const merge  = require('webpack-merge');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 动态构造 saraPageEntries、saraHtmlWebpackPluginList
const saraPageEntries = {};
const saraHtmlWebpackPluginList = []

// 获取 sara 的 app/pages 目录下所有入口文件 （entry.xx.js）
const saraEntryList = path.resolve(__dirname, '../../pages/**/entry.*.js');
glob.sync(saraEntryList).forEach((file) => {
  handleFile(file, saraPageEntries, saraHtmlWebpackPluginList)
});

// 动态构造 businessPageEntries、businessHtmlWebpackPluginList
const businessPageEntries = {};
const businessHtmlWebpackPluginList = []

// 获取 业务的 app/pages 目录下所有入口文件 （entry.xx.js）
const businessEntryList = path.resolve(process.cwd(), './app/pages/**/entry.*.js');
glob.sync(businessEntryList).forEach((file) => {
  handleFile(file, businessPageEntries, businessHtmlWebpackPluginList)
});

// 构造相关 webpack 处理的数据结构
function handleFile(file, entries = {}, htmlWebpackPluginList = []) {
  const entryName = path.basename(file, '.js'); 
 
  // 构造 entry
  entries[entryName] = file;

  // 构造最终渲染的页面文件
  htmlWebpackPluginList.push(
    // html-webpack-plugin 辅助注入打包后的 bundle 文件到 tpl 文件中
    new HtmlWebpackPlugin({
      //  产物（最终模板）输出路径
      filename: path.resolve(process.cwd(), './app/public/dist/', `${entryName}.tpl`),
      // 指定要使用的模版文件
      template: path.resolve(__dirname, '../../view/entry.tpl'),
      // 要注入的代码块
      chunks: [ entryName ]
  }))
}


let buinessWebpackConfig = {};
try {
  buinessWebpackConfig = require(`${process.cwd()}/app/webpack.config.js`)
} catch (e) {
  console.log('buinessWebpackConfig error: ', e)
}

/**
 * webpack 基础配置
 */
module.exports = merge.smart({
  // 入口配置
  entry: Object.assign(saraPageEntries, businessPageEntries),

  // 模块解析配置(决定了要加载解析那些模块，以及用什么方式去解释)
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [require.resolve('vue-loader')]
      },{
        test: /\.js$/,
        include: [
          // 只对业务代码进行 babel，加快 webpack 打包速度
          // 处理 sara 目录
          path.resolve(__dirname, '../../pages'),
          // 处理 业务 目录
          // path.resolve(process.cwd(), './app/pages')
        ],
        use: [require.resolve('babel-loader')],
      },{
        test: /\.css$/,
        use: [require.resolve('style-loader'), require.resolve('css-loader')],
      },{
        test: /\.less$/,
        use: [require.resolve('style-loader'), require.resolve('css-loader'), require.resolve('less-loader')]
      },{
        test: /\.(png|jpe?g|gif|webp)$/,
        use: [{
          loader: require.resolve('url-loader'),
          options: {
            limit: 8 * 1024, // 超过限制自动使用 file-loader
            esModule: false
          }
        }]
      },{
        test: /\.(eot|ttf|svg|woff|woff2)(\?\S*)?$/,
        use: [require.resolve('file-loader')]
      }
    ]
  },

  // 配置模块解析的具体行为(定义 webpack 在打包时，如何找到并解析具体模块的路径)
  resolve: {
    extensions: ['.js', '.vue', '.less', '.css', 'json'],
    alias: (() => {
      const aliasMap = {};
      const blankModulePath = path.resolve(__dirname, '../libs/blank.js');

      // dashboard 路由扩展配置
      const businessDashboardRouterConfig = path.resolve(process.cwd(), './app/pages/dashboard/router.js');
      aliasMap['$businessDashboardRouterConfig'] = fs.existsSync(businessDashboardRouterConfig) ? businessDashboardRouterConfig : blankModulePath;

      // schema-view component 扩展配置
      const businessComponentConfig = path.resolve(process.cwd(), './app/pages/dashboard/complex-view/schema-view/components/component-config.js');
      aliasMap['$businessComponentConfig'] = fs.existsSync(businessComponentConfig) ? businessComponentConfig : blankModulePath;

      // schema-form 扩展配置
      const businessFormItemConfig = path.resolve(process.cwd(), './app/pages/widgets/schema-form/form-item-config.js');
      aliasMap['$businessFormItemConfig'] = fs.existsSync(businessFormItemConfig) ? businessFormItemConfig : blankModulePath;

      // schema-search-bar 扩展配置
      const businessSearchItemConfig = path.resolve(process.cwd(), './app/pages/widgets/schema-search-bar/search-item-config.js');
      aliasMap['$businessSearchItemConfig'] = fs.existsSync(businessSearchItemConfig) ? businessSearchItemConfig : blankModulePath;

      // header-container 扩展配置
      const businessHeaderConfig = path.resolve(process.cwd(), './app/pages/widgets/header-container/header-config.js');
      aliasMap['$businessHeaderConfig'] = fs.existsSync(businessHeaderConfig) ? businessHeaderConfig : blankModulePath;

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
        ...aliasMap
      }
    })()
  }, 

  // 配置 webpack 插件
  plugins: [
    // 处理 .vue 文件，这个插件是必须的
    // 它的职能是将你定义过的其他规则复制并应用到 .vue 文件里
    // 例如，如果有一条匹配规则 /\.js$/ 的规则，那么它会应用到 .vue 文件中的 <script> 板块中
    new VueLoaderPlugin(),

    // 把第三方库暴露在 window context 下
    new webpack.ProvidePlugin({
      Vue: 'vue',
      axios: 'axios',
      _lodash: 'lodash'
    }),

    // 定义全局变量
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: 'true', // 支持 vue 解析 optionsApi
      __VUE_PROD_DEVTOOLS__: 'false', // 禁用 Vue 调试工具
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false', // 禁用生产环境显示 “水合” 信息
    }),

    new webpack.ProgressPlugin((percentage, message, ...args) => {
      const barLength = 15; // 进度条总长度
      const progress = Math.round(percentage * barLength); // 当前完成的长度
      const bar = `[${'='.repeat(progress)}${' '.repeat(barLength - progress)}]`; // 动态生成进度条
      const percent = `${(percentage * 100).toFixed(0)}%`; // 百分比
      const status = percentage === 1 ? 'done' : message; // 状态信息

      process.stdout.write(`\r${bar} ${percent} ${status} ${args.join(' ')}`); // 移除换行符

      // 仅在完成时添加换行
      if (percentage === 1) {
        process.stdout.write('\n');
      }
    }),

    // 构造最终的渲染页面
    ...[
      ...saraHtmlWebpackPluginList,
      ...businessHtmlWebpackPluginList
    ]
    
  ],

  // 配置一些打包输出优化 (代码分割，模块合并，缓存，treeShaking，压缩等优化策略)
  optimization: {
    /**
     * 把 js 文件打包成3种类型
     * 1. vendor: 第三方 lib 库，基本不会改动，除非以来版本升级
     * 2. common: 业务组件代码的公共部分抽取出来，改动较少
     * 3. entry.{page}: 不用页面 entry 里的业务组件代码的差异部分，会经常改动
     * 目的：把改动和引用频率不一样的 js 区分出来，以达到更好利用浏览器缓存的效果
     * 
     */
    splitChunks: {
      chunks: 'all', // 对同步和异步模块都进行分割
      maxAsyncRequests: 8, // 每次异步加载的最大并行请求数
      maxInitialRequests: 8, // 入口点的最大并行请求数
      minSize: 5 * 1024, // 最小分割文件大小 (byte)
      cacheGroups: {
        lodash: { // 打包 node_module 中的 loadsh 文件
          test: /[\\/]node_modules[\\/]lodash/, 
          name: 'lodash-runtime', 
          priority: 30, 
          enforce: true, 
          reuseExistingChunk: true, 
        },
        vendor: { // 第三方依赖库
          test: /[\\/]node_modules[\\/]/, // 打包 node_module 中的文件
          name: 'vendor', // 模块名称
          priority: 20, // 优先级，数字越大，优先级越高
          enforce: true, // 强制执行
          reuseExistingChunk: true, // 复用已有的公共 chunk
        },
        common: { // 公共模块
          test: /[\\/]widgets|common[\\/]/, 
          name: 'common', // 模块名称
          minChunks: 2, // 被两处引用即被归为公共模块
          priority: 10, // 优先级
          reuseExistingChunk: true, // 复用已有的公共 chunk
        }
      }
    },

    // 把 webpack 运行时代码打包到 runtime.js
    runtimeChunk: 'single', // 多个入口共享运行时文件

  },

  // cache: {
  //   type: 'filesystem', // 启用持久化缓存
  //   buildDependencies: {
  //       config: [__filename], // 依赖配置文件变化时重新构建缓存
  //   },
  // },
}, buinessWebpackConfig)