import Input from './complex-view/input/input.vue';
import Select from './complex-view/select/select.vue';
import DynamicSelect from './complex-view/dynamic-select/dynamic-select.vue';
import DateRange from './complex-view/date-range/date-range.vue';

// 业务扩展 search-item 配置
import businessSearchItemConfig from '$businessSearchItemConfig'

const SearchItemConfig = {
  input: {
    component: Input
  },
  select: {
    component: Select,
  },
  dynamicSelect: {
    component: DynamicSelect,
  },
  dateRange: {
    component: DateRange,
  }
}

export default {
  ...SearchItemConfig,
  ...businessSearchItemConfig
}
