import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { LoggerProvider } from '../../extend/logger.provider';

/** 只用到的 Response 形状（仓库未装 @types/express） */
interface HttpResponseLike {
  headersSent: boolean;
  status(code: number): HttpResponseLike;
  json(body: unknown): void;
  redirect(status: number, url: string): void;
}

/** 1.0 中 template not found 的判定：nunjucks 报 'template not found'，express 视图引擎报 'Failed to lookup view' */
const TEMPLATE_NOT_FOUND_PATTERNS = ['template not found', 'Failed to lookup view'];

/**
 * 对照 app/middlewares/error-handler.js
 *
 * 只兜底「没人接住的抛错」：
 * - 业务主动返回的 success / fail 不经过这里（BaseController 已 return）
 * - Pipe 抛出的 HttpException（如 442）与框架 HttpException（如 404）原样透传，不改写
 * - 其余未知异常：记日志，HTTP 200 + { success:false, code:50000, message }
 * - 模板不存在：302 到 config 里的 homePage
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerProvider,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<HttpResponseLike>();

    // Guard 已自行写出响应（如登录态校验）时直接跳过，避免二次写响应
    if (res.headersSent) {
      return;
    }

    this.logger.error('[-- exception --]:', exception);

    if (this.isTemplateNotFound(exception)) {
      res.redirect(302, this.config.get<string>('homePage') ?? '/');
      return;
    }

    if (exception instanceof HttpException) {
      res.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    res.status(200).json({
      success: false,
      code: 50000,
      message: '网络异常 请稍后重试',
    });
  }

  private isTemplateNotFound(exception: unknown): boolean {
    const message = exception instanceof Error ? exception.message : '';
    return TEMPLATE_NOT_FOUND_PATTERNS.some((pattern) => message.includes(pattern));
  }
}
