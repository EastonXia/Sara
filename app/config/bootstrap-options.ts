/**
 * serverStart(options) 透传进来的启动参数，由 ConfigModule.register 以 BOOTSTRAP_OPTIONS 注入。
 */
export const BOOTSTRAP_OPTIONS = Symbol('BOOTSTRAP_OPTIONS');

export interface BootstrapOptions {
  name?: string;
  homePage?: string;
  icon?: string;
  [key: string]: unknown;
}
