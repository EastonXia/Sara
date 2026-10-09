const path = require('path');
const merge  = require('webpack-merge');
// const os = require('os');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CSSMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackInjectAttributesPlugin = require('html-webpack-inject-attributes-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
// const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const threadLoader = require('../loader/thread-loader');

// 基类配置
const baseConfig = require('./webpack.base');

const webpackConfig = merge.smart(baseConfig, {
  // 指定生产环境
  mode: 'production',

  // 生产环境的 output 配置
  output: {
    filename: 'js/[name]_[chunkhash:8].bundle.js',
    chunkFilename: 'js/[name]_[chunkhash:8].chunk.js',
    path: path.join(process.cwd(), './app/public/dist/prod'),
    publicPath: '/dist/prod/',
    crossOriginLoading: 'anonymous', // Webpack 输出的 JavaScript 资源支持跨域加载
  },

  module: {
    rules: [{
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        threadLoader('css-pool'),
        require.resolve('css-loader'),
      ]
    },{
      test: /\.js$/,
      include: [
        // 处理 sara 目录
        path.resolve(__dirname, '../../pages'),
        // 处理 业务 目录
        path.resolve(process.cwd(), './app/pages')
      ],
      use: [
        threadLoader('js-pool'),
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [require.resolve('@babel/preset-env')],
            plugins: [
              [require.resolve('@babel/plugin-transform-runtime')]
            ],
          },
        }
      ]
    },{
      test: /\.(png|jpe?g|gif|webp)$/,
      use: [{
        loader: require.resolve('url-loader'),
        options: {
          limit: 8 * 1024, // 超过限制自动使用 file-loader
          esModule: false
        }
      },
      // {
      //   loader: ImageMinimizerPlugin.loader,
      // }
    ]
    },
  ]
  },

  // webpack 不会有大量 hints 信息，默认为 warning
  performance: {
    hints: false
  },

  plugins: [
    // 每次 build 前，清空 public/dist 目录
    new CleanWebpackPlugin(['public/dist'],{
      root: path.resolve(process.cwd(), './app/'),
      exclude: [],
      verbose: true,
      dry: false,
    }),

    // 提取 css 公共部分，有效利用缓存，（非公共部分使用 inline）
    new MiniCssExtractPlugin({
      filename: 'css/[name]_[contenthash:8].bundle.css', // 很奇怪，用 filename 可以打包出对应格式，chunkFilename 不行
      chunkFilename: 'css/[name]_[contenthash:8].chunk.css',
    }),

    // 浏览器在请求资源时不发送用户的身份凭证
    new HtmlWebpackInjectAttributesPlugin({
      crossorigin: 'anonymous'
    }),

    // 优化图片资源,自带多线程处理
    // new ImageMinimizerPlugin({
    //   minimizer: {
    //     filename: 'image/[name]_[hash:8].[ext]',
    //     implementation: ImageMinimizerPlugin.imageminGenerate,
    //     options: {
    //       plugins: [
    //         ['gifsicle', { interlaced: true }],
    //         ['jpegtran', { progressive: true }],
    //         ['optipng', { optimizationLevel: 5 }],
    //       ]
    //     }
    //   }
    // })
  ],

  optimization: {
    // 使用 TerserPlugin 的并发和缓存，提升压缩阶段的性能
    // 清除 console.log
    minimize: true,
    minimizer: [
      new TerserWebpackPlugin({
        cache: true, // 启用缓存来加速构建过程
        parallel: true, // 利用多核 cpu 的优势来加快压缩速度
        terserOptions: {
          compress: {
            drop_console: true, // 去掉 console.log 内容
          }
        }
      }),
      
      // 优化并压缩 css 资源
      new CSSMinimizerWebpackPlugin(),
    ]
  }
})


module.exports = webpackConfig;