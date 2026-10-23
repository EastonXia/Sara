import { INestApplication } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';

/**
 * 对照 app/middleware.js 里两行 koa-static：把 app/public 当站点根挂两份。
 * 找不到文件就 next()，交给后面的路由（与 koa-static 一致）。
 *
 * 必须在 NestFactory.create 之后、app.listen 之前直接挂在 httpAdapter 上；
 * 不用 MiddlewareConsumer.forRoutes('*')（Nest 12 会挂成 app.all('/{*path}')，
 * 静态资源 301 加尾斜杠后被 Filter 收成 50000），也不用 ServeStaticModule.forRoot。
 */
export function applyStaticAssets(app: INestApplication): void {
  const httpApp = app.getHttpAdapter().getInstance() as express.Express;
  const options = { fallthrough: true, redirect: false };

  // 框架：编译后位于 dist/common/middleware → 仓库根 app/public
  httpApp.use(express.static(path.resolve(__dirname, '../../../app/public'), options));
  // 业务：使用方工程 app/public
  httpApp.use(express.static(path.resolve(process.cwd(), 'app/public'), options));
}
