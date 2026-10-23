import { Controller, Get, Query } from '@nestjs/common';
import { BaseController } from '../../common/base/base.controller';
import { GetListDto } from './dto/get-list.dto';
import { GetProjectDto } from './dto/get-project.dto';
import { ModelItem } from './model.service';
import { ProjectService } from './project.service';

/**
 * 对照 app/controller/project.js + app/router/project.js
 * 路由与 1.0 完全一致：/api/project、/api/project/list、/api/project/model_list
 */
@Controller('api/project')
export class ProjectController extends BaseController {
  constructor(private readonly projectService: ProjectService) {
    super();
  }

  /**
   * 根据 proj_key 获取项目配置
   */
  @Get()
  async getProject(@Query() query: GetProjectDto) {
    const projectConfig = await this.projectService.get(query.proj_key);

    if (!projectConfig) {
      return this.fail('获取项目异常', 50000);
    }

    return this.success(projectConfig);
  }

  /**
   * 获取当前 proj_key 对应模型下的项目列表（如果无 proj_key，全量获取）
   */
  @Get('list')
  async getList(@Query() query: GetListDto) {
    const projectList = await this.projectService.getList({ projKey: query.proj_key });

    // 只返回关键数据
    const dtoProjectList = projectList.map((item) => {
      const { modelKey, key, name, desc, homePage } = item;
      return { modelKey, key, name, desc, homePage };
    });

    return this.success(dtoProjectList);
  }

  /**
   * 获取所有模型与项目的结构化数据
   */
  @Get('model_list')
  async getModelList() {
    const modelList: ModelItem[] = await this.projectService.getModelList();

    // 构造返回结果，只返回关键数据
    const dtoModelList = modelList.reduce<Array<Record<string, unknown>>>((preList, item) => {
      const { model, project } = item;

      // 构造 model 关键数据
      const { key, name, desc } = model;
      const dtoModel = { key, name, desc };

      // 构造 project 关键数据
      const dtoProject = Object.keys(project).reduce<Record<string, unknown>>((preObj, projKey) => {
        const { key: pKey, name: pName, desc: pDesc, homePage } = project[projKey];
        preObj[projKey] = { key: pKey, name: pName, desc: pDesc, homePage };
        return preObj;
      }, {});

      preList.push({
        model: dtoModel,
        project: dtoProject,
      });

      return preList;
    }, []);

    return this.success(dtoModelList);
  }
}
