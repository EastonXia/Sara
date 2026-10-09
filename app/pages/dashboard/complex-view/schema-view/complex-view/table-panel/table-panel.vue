<template>
  <el-card class="table-panel">
    <!-- operation-panel -->
    <el-row 
      v-if="tableConfig?.headerButtons?.length > 0"
      justify="end"
      class="operation-panel"
    >
      <el-button
        v-for="item in tableConfig?.headerButtons"
        v-bind="item"
        @click="operationHandler({ btnConfig: item })"
      >
        {{ item.label }}
      </el-button>
    </el-row>
    <!-- schema-table (组件 widget) -->
    <schema-table 
      ref="schemaTableRef"
      :schema="tableSchema"
      :api="api"
      :apiParams="apiParams"
      :buttons="tableConfig?.rowButtons ?? []"
      @operate="operationHandler"
    />
  </el-card>
</template>

<script setup>
import { ref, inject } from 'vue'
import { ElMessageBox, ElNotification } from 'element-plus';
import $curl from '$saraCommon/curl';
import SchemaTable from '$saraWidgets/schema-table/schema-table.vue';

const emit = defineEmits(['operate'])

const {
  api, 
  tableSchema, 
  tableConfig,
  apiParams, 
} = inject('schemaViewData');
const schemaTableRef = ref(null)

const EventHandlerMap = {
  remove: removeData,
}

const operationHandler = ({ btnConfig, rowData }) => {
  const { eventKey } = btnConfig;
  console.log("eventKey", eventKey)

  if(EventHandlerMap[eventKey]) {
    EventHandlerMap[eventKey]({ btnConfig, rowData })
  } else {
    emit('operate', { btnConfig, rowData })
  }
}

function removeData ({ btnConfig, rowData }) {
  const { eventOption } = btnConfig;
  if(!eventOption?.params) return;
  
  const { params } = eventOption;
  const removeKey = Object.keys(params)[0];

  let removeValue;
  const removeValueList = params[removeKey].split('::');
  if(removeValueList[0] === 'schema' && removeValueList[1]) {
    removeValue = rowData[removeValueList[1]];
  }

  ElMessageBox.confirm(
    `确认删除 ${removeKey} 为：${removeValue} 数据`, 
    'Warning',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    schemaTableRef.value.showLoading();
    const res = await $curl({
      method: 'delete',
      url: api.value,
      data: {
        [removeKey]: removeValue
      },
      erroeMessages: '删除失败'
    });
    schemaTableRef.value.hideLoading();

    if(!res || !res.success || !res.data) {
      return;
    }

    ElNotification({
      title: '删除成功',
      message: '删除成功',
      type: 'success',
    })

    await initTableData()
  })
}

const initTableData = async () => {
  await schemaTableRef.value.initData()
}

const loadTableData = async() => {
  await schemaTableRef.value.loadTableData();
}

defineExpose({
  initTableData,
  loadTableData,
})
</script>

<style lang="less" scoped>
.table-panel {
  flex: 1;
  margin: 10px;

  .operation-panel {
    margin-bottom: 10px;
  }
}

:deep(.el-card_body) {
  height: 98%;
  display: flex;
  flex-direction: column;
}
</style>