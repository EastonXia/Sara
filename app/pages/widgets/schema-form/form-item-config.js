import Input from './complex-view/input/input.vue';
import InputNumber from './complex-view/input-number/input-number.vue';
import Select from './complex-view/select/select.vue';

// 业务扩展 form-item 配置
import businessFormItemConfig from '$businessFormItemConfig';

const FormItemConfig = {
  input: {
    component: Input
  },
  inputNumber: {
    component: InputNumber
  },
  select: {
    component: Select
  }
}

export default {
  ...FormItemConfig,
  ...businessFormItemConfig
}