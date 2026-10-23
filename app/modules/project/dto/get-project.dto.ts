import { IsDefined, IsString } from 'class-validator';

/**
 * 对照 app/router-schema/project.js 的 '/api/project' GET
 * proj_key 必填字符串（与 1.0 ajv 的 required 一致，只校验存在与类型）
 */
export class GetProjectDto {
  @IsDefined()
  @IsString()
  proj_key!: string;
}
