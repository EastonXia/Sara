import { Injectable } from '@nestjs/common';

/**
 * 对照 app/extend/logger.js
 * 1.0 行为：local 环境打到控制台，其余环境走 log4js 落盘。
 * 本步只保留控制台实现，log4js 分支留到后续集。
 */
@Injectable()
export class LoggerProvider {
  info(message: string, ...meta: unknown[]): void {
    console.log(message, ...meta);
  }

  error(message: string, ...meta: unknown[]): void {
    console.error(message, ...meta);
  }
}
