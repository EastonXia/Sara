<template>
  <el-sub-menu :index="menuItem.key">
    <template #title>{{ menuItem.name }}</template>
    <div :key="item.key" v-for="item in menuItem.subMenu">
      <SubMenu
        v-if="item.subMenu && item.subMenu.length > 0"
        :menuItem="item"
      /> 
      <el-menu-item v-else :index="item.key">
        {{ item.name }}
      </el-menu-item>
    </div>
  </el-sub-menu>
</template>

<script setup>
const { menuItem } = defineProps([ 'menuItem' ]);
</script>

<style lang="less" scoped>

</style>