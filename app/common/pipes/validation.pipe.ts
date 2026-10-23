import { HttpException, HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';

/**
 * 全局参数校验（对照 app/middlewares/api-params-vertify.js + router-schema）
 *
 * 与 1.0 对齐的点：
 * - 失败：HTTP 200 + { success:false, message:'request validate fail: ...', code:442 }
 * - 只报第一条错误（ajv 默认 allErrors=false，只报首个错误）
 * - 不做隐式类型转换（ajv 未开 coerceTypes，query 的 "1" 不会被当成 number）
 * - 只校验 query / body（1.0 的 router-schema 没有 headers / params 定义）
 *
 * 与 1.0 不同、需要知道的点：
 * - whitelist: true 会剥掉 DTO 未声明的字段；1.0 的 ajv 不剥离，原样进 controller。
 *   T6 迁移业务接口时要留意这一点。
 *
 * DTO 模式（给 project 以外的接口预留）：
 * - DTO 为 class，放在 modules/<domain>/dto/<name>.dto.ts
 * - 1.0 schema → class-validator：required → @IsDefined()；string → @IsString()；
 *   number → @IsNumber()（body 的 JSON 数字）；可选字段 → @IsOptional()
 * - controller 用 @Query() / @Body() 接收 DTO，不在 handler 里手写 if 校验
 */
export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: false },
    stopAtFirstError: true,
    exceptionFactory: (errors: ValidationError[]) => {
      const first = errors[0];
      const message = Object.values(first?.constraints ?? {})[0] ?? 'invalid';
      return new HttpException(
        { success: false, message: `request validate fail: ${message}`, code: 442 },
        HttpStatus.OK,
      );
    },
  });
}
