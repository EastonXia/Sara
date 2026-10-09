import CreateForm from "./create-form/create-form.vue";
import EditForm from './edit-form/edit-form.vue';
import DetailPanel from "./detail-panel/detail-panel.vue";

// 业务扩展 component 配置
import businessComponentConfig from '$businessComponentConfig'

const ComponentConfig = {
  createForm: {
    component: CreateForm
  },
  editForm: {
    component: EditForm
  },
  detailPanel: {
    component: DetailPanel
  }
}

export default {
  ...ComponentConfig,
  ...businessComponentConfig
}