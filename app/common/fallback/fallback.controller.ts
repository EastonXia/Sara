import { Controller, Get, Res } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

interface RedirectResponse {
  redirect(status: number, url: string): void;
}

/**
 * 兜底路由：前面的路由都没命中的 GET 统一 302 到 homePage。
 * 必须排在所有业务模块之后（由 SaraModule 的 imports 顺序保证）。
 */
@Controller()
export class FallbackController {
  constructor(private readonly config: ConfigService) {}

  @Get('*')
  fallback(@Res() res: RedirectResponse): void {
    res.redirect(302, this.config.get<string>('homePage') ?? '/');
  }
}
