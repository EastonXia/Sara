import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ApiSignGuard } from './common/guards/api-sign.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ProjKeyInterceptor } from './common/interceptors/proj-key.interceptor';
import { createValidationPipe } from './common/pipes/validation.pipe';
import { AppModule } from './app.module';
import { BootstrapOptions } from './config/bootstrap-options';
import { ConfigService } from './config/config.service';
import { LoggerProvider } from './extend/logger.provider';
import { SaraModule } from './sara.module';

/**
 * 创建已挂好全部横切能力（静态、异常、验签、proj_key、参数校验）的 Nest 应用，但不监听端口。
 * 测试与 bootstrap 共用，保证两者行为一致。
 */
export async function createApp(options: BootstrapOptions = {}): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule.register(options));

  // 静态兜底：app/public 当站点根（框架 + 业务各一份），必须紧跟 create
  SaraModule.configureStatic(app);

  // 全局异常兜底：未处理抛错 → 50000 / template not found → 302 homePage
  app.useGlobalFilters(new AllExceptionsFilter(app.get(ConfigService), app.get(LoggerProvider)));

  // 全局接口验签：先于参数校验执行（与 1.0 中间件顺序一致）
  app.useGlobalGuards(new ApiSignGuard(app.get(ConfigService), app.get(LoggerProvider)));

  // 全局 proj_key 处理：只管 /api/proj/，缺失返回 446（守卫之后、管道之前）
  app.useGlobalInterceptors(new ProjKeyInterceptor());

  // 全局参数校验：失败返回 HTTP 200 + code 442（与 1.0 api-params-vertify 一致），不用 Nest 默认 400
  app.useGlobalPipes(createValidationPipe());

  return app;
}

/**
 * 启动 Nest 应用并监听端口。对外入口是 index.js 的 serverStart。
 * 端口与 host 沿用 1.0：PORT 默认 8080，IP 默认 0.0.0.0。
 */
export async function bootstrap(options: BootstrapOptions = {}): Promise<INestApplication> {
  const app = await createApp(options);

  const port = process.env.PORT || 8080;
  const host = process.env.IP || '0.0.0.0';
  await app.listen(port, host);
  console.log(`Server running on port: ${port}`);
  return app;
}
