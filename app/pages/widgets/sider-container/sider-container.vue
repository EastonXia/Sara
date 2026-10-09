<template>
  <el-container class="sider-container">
    <el-aside width="200px" class="aside">
      <slot name="menu-content"></slot>
    </el-aside>
    <el-main class="main">
      <slot name="main-content"></slot>
    </el-main>
  </el-container>
</template>

<script setup>
  
</script>

<style lang="less" scoped>
.sider-container{ 
  height: 100%;

  .aside {
    border-right: 1px solid #e8e8e8;
  }

  .main {
    overflow: scroll;
  }
}
</style>