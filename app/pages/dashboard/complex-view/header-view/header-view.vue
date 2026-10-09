<template>
  <HeaderContainer :title="projName">
    <template #menu-content>
      <!-- 根据 menuStore.menu 渲染 -->
      <el-menu 
        :default-active="activeKey"
        :ellipsis="false"
        mode="horizontal"
        @select="onMenuSelect"
      >
        <template v-for="item in menuStore.menuList">
          <SubMenu
            v-if="item.subMenu && item.subMenu.length > 0"
            :menu-item="item"
          />
          <el-menu-item
            v-else
            :index="item.key"
          >
            {{ item.name }}
          </el-menu-item>
        </template>
      </el-menu>
    </template> 
    <template #setting-content>
      <!-- 根据 projStore.projectList 渲染 -->
      <el-dropdown @command="handleProjectCommand">
        <span class="project-list">
          {{ projName }}
          <el-icon v-if="projectStore.projectList.length > 1" class="el-icon--right">
            <ArrowDown />
          </el-icon>
        </span>
        <template v-if="projectStore.projectList && projectStore.projectList.length > 1" #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="item in projectStore.projectList"
              :key="item.key"
              :command="item.key"
              :disabled="item.name === projName"
            >
              {{ item.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
    <template #main-content>
      <slot name="main-content" />
    </template>
  </HeaderContainer>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'; 
import { useRoute } from 'vue-router';
import { ArrowDown } from '@element-plus/icons-vue';
import HeaderContainer from '$saraWidgets/header-container/header-container.vue';
import SubMenu from './complex-view/sub-menu/sub-menu.vue';
import { useMenuStore } from '$saraStore/menu';
import { useProjectStore } from '$saraStore/project';

const route = useRoute();
const menuStore = useMenuStore();
const projectStore = useProjectStore();

defineProps({
  projName: String
});

const emit = defineEmits(['menu-select']);

const activeKey = ref('');

watch(() => route.query.key, () => {
  setActivedKey();
});

watch(() => menuStore.menuList, () => {
  setActivedKey();
}, { deep: true });

onMounted(() => {
  setActivedKey();
});

const setActivedKey = () => {
  const menuItem = menuStore.findMenuItem({
    key: 'key',
    value: route.query.key,
  })

  activeKey.value = menuItem?.key ?? '';
}

const onMenuSelect = (menuKey) => {
  const menuItem = menuStore.findMenuItem({
    key: 'key',
    value: menuKey,
  })
  emit('menu-select', menuItem);
}

// 切换项目方法
const handleProjectCommand = (event) => {
  const projectItem = projectStore.projectList.find(item => item.key === event);
  if(!projectItem || !projectItem.homePage) {
    return;
  }
  const { host } =  window.location;
  console.log('projectItem', projectItem)
  window.location.replace(`http://${host}/view/dashboard${projectItem.homePage}`);
}
</script>

<style lang="less" scoped>
:deep(.el-menu--horizontal.el-menu) {
  border-bottom: 0;
}
.project-list {
  margin-right: 20px;
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  outline: none;
}

</style>