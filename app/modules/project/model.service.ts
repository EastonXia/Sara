import { Injectable } from '@nestjs/common';
import loadModelList = require('../../../model/index');

export interface ModelConfig {
  key: string;
  name?: string;
  desc?: string;
  [field: string]: unknown;
}

export interface ProjectConfig {
  key: string;
  modelKey: string;
  name?: string;
  desc?: string;
  homePage?: string;
  [field: string]: unknown;
}

export interface ModelItem {
  model: ModelConfig;
  project: Record<string, ProjectConfig>;
}

/**
 * 封装 model/index.js 的加载（model/index.js 本身不改）。
 * 1.0 里 model 目录位于 app.baseDir（即 process.cwd()），这里同样以 cwd 为准。
 */
@Injectable()
export class ModelService {
  private readonly modelList: ModelItem[] = loadModelList({ baseDir: process.cwd() });

  list(): ModelItem[] {
    return this.modelList;
  }
}
