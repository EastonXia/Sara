module.exports = (app) => {
  const baseController = require('./base')(app);
  
  return class projectController extends baseController {

    /**
     * 根据 proj_key 获取项目配置
     * @param {*} ctx 
     */
    async getProject(ctx) {
      const { proj_key: projKey } = ctx.request.query;
      const { project: projectService } = app.service;
      const projectConfig = await projectService.getProject(projKey);

      if(!projectConfig) {
        this.fail(ctx, '获取项目异常', 50000);
        return;
      }

      this.success(ctx, projectConfig);
    }

    /**
     * 获取当前 projectKey 对应模型下的项目列表 （如果无 projectKey，全量获取）
     * @param {*} ctx 
     */
    async getList(ctx) {
      const { proj_key: projKey } = ctx.request.query;
      
      const { project: projectService } = app.service;
      const projectList = await projectService.getList({ projKey });

      // 构造关键数据 list
      const dtoProjectList = projectList.map((item) => {
        const { modelKey, key, name, desc, homePage } = item;
        return { modelKey, key, name, desc, homePage };
      });

      this.success(ctx, dtoProjectList);
    }
    
    /**
     * 获取所有模型与项目的结构化数据
     * @param {*} ctx 
     */
    async getModelList(ctx) {
      const { project: projectService } = app.service;
      const modelList = await projectService.getModelList();

      // 构造返回结果，只返回关键数据
      const dtoModelList = modelList.reduce((preList, item) => {
        const { model, project } = item;

        // 构造 model 关键数据
        const { key, name, desc } = model;
        const dtoModel = { key, name, desc};

        // 构造 project 关键数据
        const dtoProject = Object.keys(project).reduce((preObj, projKey) => {
          const { key, name, desc, homePage } = project[projKey];
          preObj[projKey] = { key, name, desc, homePage }
          return preObj;
        }, {});

        // 整合返回结构
        preList.push({
          model: dtoModel,
          project: dtoProject
        })

        return preList;
      },[])

      this.success(ctx, dtoModelList)
    }
  }
}