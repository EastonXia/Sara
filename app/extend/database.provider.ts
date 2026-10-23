import { Injectable } from '@nestjs/common';
import knexFactory = require('knex');
import { ConfigService } from '../config/config.service';

type KnexConfig = Parameters<typeof knexFactory>[0];

/**
 * 对照 app/extend/database.js
 * 1.0 行为：配置里没有 db 时返回空；有 db 时创建 knex 实例。
 */
@Injectable()
export class DatabaseProvider {
  readonly knex: ReturnType<typeof knexFactory> | null;

  constructor(private readonly config: ConfigService) {
    const dbConfig = this.config.get<KnexConfig>('db');
    this.knex = dbConfig ? knexFactory(dbConfig) : null;
  }
}
