<template>
  <div class="schema-table">
    <el-table 
      v-if="schema && schema.properties"
      v-loading="loading"
      :data="tableData"
      class="table"
    >
      <template v-for="(schemaItem, key) in schema.properties">
        <el-table-column 
          v-if="schemaItem.option.visible !== false"
          :key="key"
          :prop="key"
          :label="schemaItem.label"
          v-bind="schemaItem.option"
        />
      </template>
      <el-table-column
        v-if="buttons?.length > 0"
        label="操作"
        fixed="right"
        :width="operationWidth"
      >
        <template #default="scope">
          <el-button
            v-for="item in buttons"
            link
            v-bind="item"
            @click="operationHandler({ btnConfig: item, rowData: scope.row })"
          >
            {{ item.label }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-row justify="end" class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="onPageSizeChange"
        @current-change="onCurrentPageChange"
      />
    </el-row>
  </div>
</template>

<script setup>
import { ref, toRefs, computed, onMounted, watch, nextTick } from 'vue';
import $curl from '$saraCommon/curl';

const props = defineProps({
  /**
   * schema 配置，结构如下：
   * {
        type: 'object',
        properties: {
          key: {
            ...schema, // 标准 schema 配置
            type: '', // 字段类型
            label: '', // 字段的中文名
            option: {
              ...elTableColumnConfig, // 标准 el-table-colomn 配置
              visiable: true, // 默认为 true（false 或不配置时，表示不再表单中显示）
            },
          }
        }
      },
   */
  schema: Object,

  /**
   * 表格数据源 api
   */
  api: String,

  /**
   * api 请求参数，请求 API 时携带
   */
  apiParams: Object,
  /**
   * buttons 操作按钮相关按钮，结构如下：
   *  [{
        label: '', // 按钮中文名
        eventKey: '', // 按钮事件名
        eventOption: {}, // 按钮具体配置
        ...elButtonConfig, // 标准 el-button 配置
      }]
   */
  buttons: Array
})
const { schema, api, buttons, apiParams } = toRefs(props);
const emit = defineEmits(['operate']);

const operationWidth = computed(() => {
  return buttons?.value?.length > 0 ? buttons.value.reduce((pre, cur) => {
    return pre + cur.label.length * 18
  }, 50): 50
})

const loading = ref(false);
const tableData = ref([]);
const currentPage = ref(1);
const pageSize = ref(50);
const total = ref(0);

onMounted(() => {
  initData();
})

watch([schema, api, apiParams], () => {
  initData();
}, { deep: true })

const initData = () => {
  currentPage.value = 1;
  pageSize.value = 50;
  nextTick(async () => {
    await loadTableData();
  })
}

let timerId = null;
const loadTableData = async () => {
  clearTimeout(timerId);
  timerId = setTimeout(async () => {
    await fetchTableData()
    timerId = null; // 清空引用，让 gc 执行
  },100)
}

const fetchTableData = async() => {
  if(!api.value) return;
  showLoading()

  // 请求 table 数据
  const res = await $curl({
    method: 'get',
    url: `${api.value}/list`,
    query: {
      ...apiParams.value,
      page: currentPage.value,
      size: pageSize.value,
    }
  })

  hideLoading()

  if(!res || !res.success || !Array.isArray(res.data)) {
    tableData.value = [];
    total.value = 0;
    return;
  }

  tableData.value = buildTableData(res.data);
  total.value = res.metadata.total;
}

/**
 * 对后端返回的数据进行渲染前的预处理
 * @param listData 列表数据
 */
const buildTableData = (listData) => {
  if(!schema.value?.properties) {
    return listData
  }
  return listData.map((rowData) => {
    for(const dKey in rowData) {
      const schemaItem = schema.value.properties[dKey];
      // 处理 toFixed 配置
      if(schemaItem?.option?.toFixed) {
        rowData[dKey] = rowData.toFixed && rowData[dKey].toFixed(schemaItem.option.toFixed);
      }
    }
    return rowData;
  })
}

const showLoading = () => {
  loading.value = true;
}

const hideLoading = () => {
  loading.value = false;
}

const operationHandler = ({ btnConfig, rowData }) => {
  emit('operate', { btnConfig, rowData })
}

const onPageSizeChange = async (value) => {
  pageSize.value = value;
  await loadTableData()
}

const onCurrentPageChange = async (value) => {
  currentPage.value = value;
  await loadTableData()
}

defineExpose({
  initData,
  loadTableData,
  showLoading,
  hideLoading
})
</script>

<style lang="less" scoped>
.schema-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;

  .table {
    flex: 1
  }

  .pagination {
    margin: 10px 0;
    text-align: right;
  }
}
</style>