import { Injectable } from '@nestjs/common';
import { ModelItem, ModelService, ProjectConfig } from './model.service';

export interface ProjectListQuery {
  projKey?: string;
}

/**
 * 对照 app/service/project.js
 * 逻辑与返回结构与 1.0 保持一致。Service 不碰 ctx。
 */
@Injectable()
export class ProjectService {
  constructor(private readonly modelService: ModelService) {}

  /**
   * 根据 projKey 获取项目配置（1.0 的 getProject）
   */
  async get(projKey: string): Promise<ProjectConfig | undefined> {
    const modelList = this.modelService.list();
    return modelList.find((modelItem) => modelItem.project[projKey])?.project[projKey];
  }

  /**
   * 获取同一模型下的项目列表（如果无 projKey，全量获取）
   */
  async getList({ projKey }: ProjectListQuery): Promise<ProjectConfig[]> {
    const projectList: ProjectConfig[] = [];

    this.modelService.list().forEach((modelItem) => {
      const { project } = modelItem;

      // 如果有传 projKey，则只取当前同模型下的项目，不传的情况下则取全量
      if (projKey && !project[projKey]) {
        return;
      }

      for (const pKey in project) {
        projectList.push(project[pKey]);
      }
    });

    return projectList;
  }

  /**
   * 获取所有模型与项目的结构化数据
   */
  async getModelList(): Promise<ModelItem[]> {
    return this.modelService.list();
  }
}
