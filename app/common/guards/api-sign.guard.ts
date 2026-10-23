import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { ConfigService } from '../../config/config.service';
import { LoggerProvider } from '../../extend/logger.provider';

/** 与 1.0 app/middlewares/api-sign-vertify.js 保持一致（前端 app/pages/common/curl.js 同一 key） */
const SIGN_KEY = 'fjoq23uj90JW0J039JFWJ3J3J032JFVXER';
const SIGN_TIMEOUT_MS = 600 * 1000;

interface SignRequest {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
}

/**
 * 对照 app/middlewares/api-sign-vertify.js
 *
 * - 白名单（config 的 apiSignVerify.whiteList）直接放行
 * - 只校验 /api 路径（与 1.0 的 indexOf('/api') 判定一致）
 * - signature = md5(`${SIGN_KEY}_${s_t}`)，与 s_sign 小写比较；s_t 距今不超过 600s
 * - 失败：HTTP 200 + { success:false, message, code:445 }
 *
 * 失败时必须 throw，不能 return false（那样 Nest 会返回 403）。
 */
@Injectable()
export class ApiSignGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerProvider,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<SignRequest>();
    const { method, path, headers } = req;

    const whiteList = this.config.get<{ whiteList?: string[] }>('apiSignVerify')?.whiteList ?? [];
    if (whiteList.includes(path)) {
      return true;
    }

    if (path.indexOf('/api') < 0) {
      return true;
    }

    const sSign = headers['s_sign'];
    const st = headers['s_t'];

    const signature = createHash('md5').update(`${SIGN_KEY}_${String(st)}`).digest('hex');
    this.logger.info(`[${method} ${path}] signature: ${signature}`);

    const expired = Date.now() - Number(st) > SIGN_TIMEOUT_MS;
    if (!sSign || !st || signature !== String(sSign).toLowerCase() || expired) {
      throw new HttpException(
        { success: false, message: 'signature not correct or api timeout', code: 445 },
        HttpStatus.OK,
      );
    }

    return true;
  }
}
