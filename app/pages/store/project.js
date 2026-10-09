import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProjectStore = defineStore('project', () => {
  // 项目列表
  const projectList = ref([]);

  // 设置 project 配置
  const setProjectList = (list) => {
    projectList.value = list;
  };

  return {
    projectList,
    setProjectList,
  }
});
