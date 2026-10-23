import { DynamicModule, INestApplication, Module, Type } from '@nestjs/common';
import * as fs from 'fs';
import { createRequire } from 'module';
import * as path from 'path';
import { FallbackModule } from './common/fallback/fallback.module';
import { applyStaticAssets } from './common/middleware/static.middleware';
import { ExtendModule } from './extend/extend.module';
import { ProjectModule } from './modules/project/project.module';
import { ViewModule } from './modules/view/view.module';

/** 业务仓编译产物目录（相对 process.cwd()）。只认 dist，不扫源码 .ts */
const BUSINESS_MODULES_DIR = 'dist/modules';
const MODULE_FILE_SUFFIX = '.module.js';

/** 动态加载业务模块产物（路径运行时才知道），用 createRequire，不覆盖全局 require */
const runtimeRequire = createRequire(__filename);

/** 递归收集目录下所有 *.module.js，按名字排序，保证 imports 顺序稳定 */
function collectModuleFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  return entries.flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectModuleFiles(full);
    }
    return entry.name.endsWith(MODULE_FILE_SUFFIX) ? [full] : [];
  });
}

/** 取出每个编译产物里导出的 Nest Module 类（导出名以 Module 结尾的函数） */
function scanBusinessModules(): Type<unknown>[] {
  const root = path.resolve(process.cwd(), BUSINESS_MODULES_DIR);
  return collectModuleFiles(root).flatMap(file => {
    const exported = runtimeRequire(file) as Record<string, unknown>;
    return Object.values(exported).filter(
      (value): value is Type<unknown> => typeof value === 'function' && value.name.endsWith('Module'),
    );
  });
}

/**
 * 框架根模块。业务模块由 register() 扫描产物得到，不写死在源码里。
 * 顺序钉死：Extend / Project / View / ...扫到的业务模块 / Fallback；
 * Fallback 必须最后，否则 @Get('*') 会抢走前面的 GET 路由。
 */
@Module({})
export class SaraModule {
  static register(): DynamicModule {
    return {
      module: SaraModule,
      imports: [ExtendModule, ProjectModule, ViewModule, ...scanBusinessModules(), FallbackModule],
    };
  }

  /** 静态兜底：NestFactory.create 之后立刻调用，不走 MiddlewareConsumer */
  static configureStatic(app: INestApplication): void {
    applyStaticAssets(app);
  }
}
