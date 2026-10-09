<template>
  <el-card class="search-panel">
    <SchemaSearchBar 
      :schema="searchSchema"
      @load="onLoad"
      @search="onSearch"
      @reset="onReset"
    />
  </el-card>
</template>

<script setup>
import { inject } from 'vue';
import SchemaSearchBar from '$saraWidgets/schema-search-bar/schema-search-bar.vue';

const { searchSchema } = inject('schemaViewData');

const emit = defineEmits(['search']);

const onLoad = (searchValObj) => {
  emit('search', searchValObj);
}

const onSearch = (searchValObj) => {
  emit('search', searchValObj);
}

const onReset = () => {
  emit('search', {});
}
</script>

<style lang="less" scoped>
.search-panel {
  margin: 10px 10px 0 10px;
  :deep(.el-card_body) {
    padding-bottom: 2px;
  }
}
</style>