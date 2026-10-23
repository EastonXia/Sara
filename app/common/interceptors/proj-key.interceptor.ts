import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of } from 'rxjs';

/** 业务 Controller 通过 @Req() req: ProjKeyRequest 读取 req.projKey */
export interface ProjKeyRequest {
  path: string;
  headers: Record<string, string | string[] | undefined>;
  projKey?: string;
}

interface StatusResponse {
  status(code: number): unknown;
}

/**
 * 对照 app/middlewares/project-handler.js
 *
 * - 只处理 path 包含 /api/proj/ 的请求（/api/auth、/api/project 不走）
 * - 从 request.headers.proj_key 取值，取到则挂到 request.projKey
 * - 缺失：HTTP 200 + { success:false, message:'proj_key not found', code:446 }，不调用 next.handle()
 *
 * 全局注册（app.useGlobalInterceptors），业务 Controller 不要自己解析 proj_key。
 */
@Injectable()
export class ProjKeyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<ProjKeyRequest>();

    if (req.path.indexOf('/api/proj/') < 0) {
      return next.handle();
    }

    const projKey = req.headers['proj_key'];
    if (!projKey) {
      // POST 默认 201，1.0 固定 200
      http.getResponse<StatusResponse>().status(200);
      return of({ success: false, message: 'proj_key not found', code: 446 });
    }

    req.projKey = String(projKey);
    return next.handle();
  }
}
