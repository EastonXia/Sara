/**
 * 对照 app/controller/base.js
 * 统一 API 返回结构。Nest 下直接 return 对象，不碰 ctx。
 */
export interface SuccessBody<T> {
  success: true;
  data: T;
  metadata: Record<string, unknown>;
}

export interface FailBody {
  success: false;
  message: string;
  code: number;
}

export class BaseController {
  /**
   * API 处理成功时统一返回结构
   * @param data 核心数据
   * @param metadata 附加数据
   */
  protected success<T>(data: T = {} as T, metadata: Record<string, unknown> = {}): SuccessBody<T> {
    return {
      success: true,
      data,
      metadata,
    };
  }

  /**
   * API 处理失败时统一返回结构
   * @param message 错误信息
   * @param code 错误码
   */
  protected fail(message: string, code: number): FailBody {
    return {
      success: false,
      message,
      code,
    };
  }
}
