import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { createRequire } from 'module';
import * as path from 'path';
import { BOOTSTRAP_OPTIONS, BootstrapOptions } from './bootstrap-options';

type ConfigObject = Record<string, unknown>;

/** 动态加载业务配置文件（路径运行时才知道），用 createRequire，不覆盖全局 require */
const runtimeRequire = createRequire(__filename);

/**
 * 对照 elpis-core/loader/config.js + env.js
 *
 * 合并顺序（后者覆盖前者，浅合并，与 1.0 一致）：
 *   框架 config/config.default.js
 *   ← 业务 app/config/config.default.js
 *   ← 业务 app/config/config.{local|beta|prod}.js（按 _ENV）
 *   ← options 中的 name、homePage
 */
@Injectable()
export class ConfigService {
  private readonly config: ConfigObject;
  private readonly rawEnv: string | undefined = process.env._ENV;

  private readonly bootstrapOptions: BootstrapOptions;

  constructor(@Inject(BOOTSTRAP_OPTIONS) options: BootstrapOptions) {
    this.bootstrapOptions = options;
    const frameworkConfigDir = path.resolve(__dirname, '../../config');
    const businessConfigDir = path.resolve(process.cwd(), 'app/config');

    const frameworkDefault = this.loadIfExists(path.join(frameworkConfigDir, 'config.default.js'));
    const businessDefault = this.loadIfExists(path.join(businessConfigDir, 'config.default.js'));
    const envOverlay = this.loadIfExists(path.join(businessConfigDir, `config.${this.envFileSuffix()}.js`));

    this.config = {
      ...frameworkDefault,
      ...businessDefault,
      ...envOverlay,
      ...this.pickDefined(options, ['name', 'homePage']),
    };
  }

  get<T = unknown>(key: string): T | undefined {
    return this.config[key] as T | undefined;
  }

  /** 启动参数原值（对照 1.0 app.options），供 View 注入模板 */
  getBootstrapOptions(): BootstrapOptions {
    return this.bootstrapOptions;
  }

  isLocal(): boolean {
    return this.rawEnv === 'local';
  }

  isBeta(): boolean {
    return this.rawEnv === 'beta';
  }

  isProduction(): boolean {
    return this.rawEnv === 'production';
  }

  private envFileSuffix(): string | undefined {
    if (this.isLocal()) return 'local';
    if (this.isBeta()) return 'beta';
    if (this.isProduction()) return 'prod';
    return undefined;
  }

  private loadIfExists(file: string): ConfigObject {
    if (!fs.existsSync(file)) {
      return {};
    }
    return runtimeRequire(file) as ConfigObject;
  }

  private pickDefined(options: BootstrapOptions, keys: string[]): ConfigObject {
    return keys.reduce<ConfigObject>((acc, key) => {
      if (options[key] !== undefined) {
        acc[key] = options[key];
      }
      return acc;
    }, {});
  }
}
