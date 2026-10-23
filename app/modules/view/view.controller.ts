import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import * as nunjucksModule from 'nunjucks';
import * as path from 'path';
import { ConfigService } from '../../config/config.service';
import { LoggerProvider } from '../../extend/logger.provider';

interface NunjucksEnv {
  render(name: string, context: Record<string, unknown>): string;
}

interface NunjucksLike {
  Environment: new (loader: unknown, opts: Record<string, unknown>) => NunjucksEnv;
  FileSystemLoader: new (searchPath: string, opts?: Record<string, unknown>) => unknown;
}

// 仓库未装 @types/nunjucks，这里按最小形状收口
const nunjucks = nunjucksModule as unknown as NunjucksLike;

/**
 * 对照 app/controller/view.js + app/router/view.js
 *
 * 路由：/view/:page 与 /view/:page/<任意后缀>；page 只取第一段，
 * 后缀（如 dashboard/schema）交给前端路由，服务端不解析。
 * 渲染：读 process.cwd()/app/public/dist/entry.{page}.tpl，Nunjucks（nocache + trimBlocks，同 koa-nunjucks-2 配置）。
 */
@Controller('view')
export class ViewController {
  private readonly env: NunjucksEnv;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerProvider,
  ) {
    this.env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(path.resolve(process.cwd(), 'app/public'), { noCache: true }),
      { trimBlocks: true },
    );
  }

  // Nest 12：同一方法用数组挂两条路由；禁止 ':page/*'，也禁止叠两个 @Get
  @Get([':page', ':page/{*path}'])
  @Header('Content-Type', 'text/html; charset=utf-8')
  renderPage(@Param('page') page: string, @Query() query: Record<string, unknown>): string {
    this.logger.info(`[ViewController] query: ${JSON.stringify(query)}`);
    this.logger.info(`[ViewController] params: ${JSON.stringify({ page })}`);

    return this.env.render(`dist/entry.${page}.tpl`, {
      projKey: query?.proj_key,
      name: this.config.get('name'),
      env: process.env._ENV,
      options: JSON.stringify(this.config.getBootstrapOptions()),
    });
  }
}
