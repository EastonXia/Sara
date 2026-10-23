/**
 * 统一转出 Nest 符号。业务项目（demo）只从这里引入，不直接依赖 @nestjs/*：
 * - 业务不需要单独安装 @nestjs/common / @nestjs/core
 * - 框架与业务共用同一份 Nest 实例（Reflector、APP_GUARD 等 token 对得上）
 */
export * from '@nestjs/common';
export { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core';
