<template>
  <SiderContainer>
    <template #menu-content>
      <el-menu
        :default-active="activeKey"
        :ellipsis="false"
        @select="onMenuSelect"
      >
        <template v-for="item in menuList">
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
    <template #main-content>
      <RouterView />
    </template>
  </SiderContainer>
</template>

<script setup>
import { ref, watch, onMounted} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMenuStore } from '$elpisStore/menu.js';
import SiderContainer from '$elpisWidgets/sider-container/sider-container';
import SubMenu from './complex-view/sub-menu/sub-menu.vue';

const router = useRouter();
const route = useRoute();
const menuStore = useMenuStore();

const activeKey = ref('');
const menuList = ref([]);

const setActiveKey = function() {
  let siderMenuItem = menuStore.findMenuItem({
    key: 'key',
    value: route.query.sider_key
  });

  // 如果首次加载 sider-view，用户未选中左侧菜单，需要默认选中第一个
  if(!siderMenuItem) {
    const hMenuItem = menuStore.findMenuItem({
      key: 'key',
      value: route.query.key
    });

    if(hMenuItem && hMenuItem.siderConfig && hMenuItem.siderConfig.menu) {
      const sideMenuList = hMenuItem.siderConfig.menu;
      siderMenuItem = menuStore.findFirstMenuItem(sideMenuList); // 找出左侧菜单中的第一项
      if(siderMenuItem) {
        handleMenuSelect(siderMenuItem.key)
      }
    }
  }

  activeKey.value = siderMenuItem?.key;
}

const setMenuList = function() {
  const menuItem = menuStore.findMenuItem({
    key: 'key',
    value: route.query.key
  });
  if(menuItem && menuItem.siderConfig && menuItem.siderConfig.menu) {
    menuList.value = menuItem.siderConfig.menu;
  }
}

watch(() => route.query.key, () => {
  setMenuList();
  setActiveKey();
})

watch(() => menuStore.menuList, () => {
  setMenuList();
  setActiveKey();
}, { deep: true })

onMounted(() => {
  setMenuList();
  setActiveKey();
})

const handleMenuSelect = function (menuKey) {
  const menuItem = menuStore.findMenuItem({
    key: 'key',
    value: menuKey
  });
  const { moduleType, key, customConfig } = menuItem;

  // 如果点击自己，则不跳转
  if(key === route.query.sider_key) return;

  const pathMap = {
    iframe: '/iframe',
    schema: '/schema',
    custom: customConfig?.path
  }
  router.push({
    path: `/view/dashboard/sider${pathMap[moduleType]}`,
    query: {
      key: route.query.key,
      sider_key: menuKey,
      proj_key: route.query.proj_key
    }
  })
}

const onMenuSelect = function(menuKey) {
  handleMenuSelect(menuKey)
}


</script>

<style lang="less" scoped>
</style>