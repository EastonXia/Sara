import 'express';

// 给 Request 增加 projKey 字段（由 ProjKeyInterceptor 挂载）。
// 业务侧通过 import type 引入本文件即可获得增强类型。
declare module 'express-serve-static-core' {
  interface Request {
    projKey?: string;
  }
}
