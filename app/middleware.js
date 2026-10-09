const path = require('path');

module.exports = (app) => {
  // 配置静态根目录
  const koaStatic = require('koa-static');
  app.use(koaStatic(path.resolve(__dirname, './public')));
  app.use(koaStatic(path.resolve(process.cwd(), './app/public')));

  // 模版渲染引擎
  const koaNunjucks = require('koa-nunjucks-2');
  app.use(koaNunjucks({
    ext: 'tpl',
    path: path.resolve(process.cwd(), './app/public'),
    nunjucksConfig: {
      nocache: true,
      trimBlocks: true,
    }
  }))

  // 引入 ctx.body 解析中间件
  const bodyParser = require('koa-bodyparser');
  app.use(bodyParser({
    enableTypes: ['form', 'json', 'text'],
    formLimit: '100mb',
    jsonLimit: '10mb',
    textLimit: '10mb',
  }))

  // 添加洋葱模型最外层的错误捕捉
  app.use(app.middlewares.errorHandler);

  // 签名合法性校验
  app.use(app.middlewares.apiSignVertify);

  // 接口参数校验
  app.use(app.middlewares.apiParamsVertify);

  // 引入项目处理中间件
  app.use(app.middlewares.projectHandler)
}