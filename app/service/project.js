module.exports = (app) => {
  const baseService = require('./base')(app);
  const modelList = require('../../model/index')(app);
  
  return class projectService extends baseService{
    /**
     * 根据 projKey 获取项目配置
     * @param {*} projKey 
     * @returns 
     */
    async getProject(projKey) {
      return modelList.find((modelItem) => modelItem.project[projKey])?.project[projKey];
    } 
   
    /**
     * 获取同一模型下的项目列表 （如果无 projKey，全量获取）
     */
    async getList({ projKey }) {
      const projectList = [];

      modelList.forEach((modelItem) => {
        const { project } = modelItem;
        
        // 如果有传 projKey，则只取当前同模型下的项目，不传的情况下则取全量
        if(projKey && !project[projKey]) {
          return;
        }

        for(const pKey in project) {
          projectList.push(project[pKey]);
        }
      });

      return projectList;
    }


    /**
     * 获取所有模型与项目的结构化数据
     */
    async getModelList() {
      return modelList
    }
  }
}