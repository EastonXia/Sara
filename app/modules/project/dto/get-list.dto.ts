import { IsOptional, IsString } from 'class-validator';

/**
 * 对照 app/router-schema/project.js 的 '/api/project/list' GET
 * proj_key 可选字符串
 */
export class GetListDto {
  @IsOptional()
  @IsString()
  proj_key?: string;
}
