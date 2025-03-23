# Love-Elpis
一个企业级应用框架，集成了企业级后台应用的前后端的基本能力，通过自定义 dsl 配置可进行快速开发，同时通过继承的思想，对配置提供了一定的应用功能扩展能力。

关于该框架的部份设计思路：[请点击这里](https://juejin.cn/post/7462658386007228451)

### 服务端启动

在根目录下创建一个服务端入口文件，如 `server.js`，然后如下所示添加启动逻辑。

```js
// server.js

const { 
  serverStart
} = require('@eastonshay/love-elpis')

const app = serverStart({});
```

### 添加服务端能力

在根目录下创建 `app` 目录，然后根据所需功能添加目录，可提供的自定义能力有：

```
- router-schema
- router
- controller
- service
- extend
- config
```

### 前端构建

在根目录下创建一个前端入口文件，如 `build.js`，然后如下所示添加启动逻辑。

```js
// build.js

const { 
  frontendBuild
} = require('@eastonshay/love-elpis')

frontendBuild(process.env._ENV); // 'local' | 'beta' | 'prod'
```

### DSL规则添加 model 配置

在项目根目录中创建 `model`目录，然后按照 `业务领域` 划分子目录，在子目录下创建 `model.js`，表示基础领域配置。

子系统则创建 `project` 目录，然后再添加配置。例子如下：

```
---------------
 ｜—— model
  ｜—— businessA
    | —— model.js
    | —— project
      | —— projectA.js
      | —— projectB.js
  | —— businessB
    | —— model.js
    | —— project
      | —— projectC.js
      | —— projectD.js 
```

model 配置格式如下：

```js
{
  mode: 'dashboard', // 模版类型，不同模版类型对应不一样的模版数据结构
  name: '', // 名称
  desc: '', // 描述
  icon: '', // icon
  homePage: '', // 首页（项目配置）

  // 头部菜单
  menu: [{
    key: '', // 菜单唯一描述
    name: '', // 菜单名称
    menuType: '', // 枚举值，group / module

    // 当 menuType == group 时，可填
    subMenu: [
      {
        // 可递归 menuItem
      },
      ...
    ],

    // 当 menuType == module 时，可填
    moduleType: '', // 枚举值： iframe/custom/schema

    // moduleType == sider 时
    siderConfig: {
      menu: [{
        // 可递归 menuItem(除 moduleType === sider)
      }, ...]
     },

    // moduleType == iframe 时
    iframeConfig: {
      path: '', // iframe 路径
    },

    // moduleType == custom 时
    customConfig: {
      path: '', // 自定义路由路径
    },

    // moduleType == schema 时
    schemaConfig: {
      api: '', // 数据源api（遵循 RESTFUL 规范）
      schema: { // 板块数据结构
        type: 'object',
        properties: {
          key: {
            ...schema, // 标准 schema 配置
            type: '', // 字段类型
            label: '', // 字段的中文名
            tableOption: {
              ...elTableColumnConfig, // 标准 el-table-colomn 配置
              toFixed: 0, // 保留小数点后几位
              visiable: true, // 默认为 true（false 时，表示不再表单中显示）
            },
            // 字段在 search-bar 中的相关配置
            searchOption: {
              ...eleComponentConfig, // 标准 ele-component-column 配置
              comType: '', // 配置组件类型 input/select/......
              default: '', // 默认值

              // comType === 'select'
              enumList: [], // 下拉框选项

              // comType === 'select'
              api: ''
            },
            // 字段在不同动态 component 中的相关配置，前缀对应 componentConfig 中的键值
            // 如：componentConfig.createForm, 这里对应createFormOption
            // 字段在 这里对应createForm 中相关配置
            createFormOption: {
              ...eleComponentConfig, // 标准 el-component 配置
              comType: '', // 控件类型 input/select/input-number
              visible: true, // 是否展示，默认为 true
              disabled: false, // 是否禁用，默认为 false
              default: '', // 默认值

              // comType === 'select' 时生效
              enumList: [] // 枚举列表
            },
            // 字段在 editForm 表单中的相关配置
            editFormOption: {
              ...eleComponentConfig, // 标准 el-component 配置
              comType: '', // 控件类型 input/select/input-number
              visible: true, // 是否展示，默认为 true
              disabled: false, // 是否禁用，默认为 false
              default: '', // 默认值

              // comType === 'select' 时生效
              enumList: [] // 枚举列表
            },
            detailPanelOption: {
              ...eleComponentConfig, // 标准 el-component 配置
            }
          }
        },
        required: [] // 必填字段
      },
      // table 相关配置
      tableConfig: {
        headerButtons: [{
          label: '', // 按钮中文名
          eventKey: '', // 按钮事件名
          // 按钮具体配置
          eventOption: {
            // 当 eventKey === 'showComponent'
            comName: '' // 组件名称
          },
          ...elButtonConfig, // 标准 el-button 配置
        }, ...],
        rowButtons: [{
          label: '', // 按钮中文名
          eventKey: '', // 按钮事件名
          eventOption: {
            // 当 eventKey === 'showComponent'
            comName: '', // 组件名称

            // 当 eventKey === 'remove'
            params: {
              // paramKey = 参数的键值
              // rowValueKey = 参数值（当格式为 schema::tableKey 的时候，到 table 中找相应的字段）
              paramKey: rowValueKey
            }
          }, // 按钮具体配置
          ...elButtonConfig, // 标准 el-button 配置
        }, ...],
      }, 
      // search-bar 相关配置
      searchConfig: {},
      // 动态组件相关配置 
      componentConfig: {
        // create-form 表单相关配置
        createForm: {
          title: '', // 表单标题
          saveBtnText: '' // 表单保存按钮文案
        },
        // edit-form 表单相关配置
        editForm: {
          mainKey: '', // 表单主键，用于唯一标识要修改的数据对象
          title: '', // 表单标题
          saveBtnText: '', // 表单保存按钮文案
        },
        // detail-panel 相关配置
        detailPanel: {
          mainKey: '', // 表单主键，用于唯一标识要修改的数据对象
          title: '', // 表单标题
          saveBtnText: '', // 表单保存按钮文案
        }
        // ...支持用户动态扩展
      }, 
    },
  }]
}
```

### 自定义页面扩展

在 `app/pages/`目录下添加页面入口文件 `entry.xxx.js`。

### dashboard / custom-view 下自定义页面扩展

在`app/pages/dashboard/xxx` 目录下添加自定义页面逻辑。

### dashboard / schema-view / components  下动态组件扩展

1. 在  `app/pages/dashboard/complex-view/schema-view/components`下添加组件逻辑；
2. 添加组件配置文件`app/pages/dashboard/complex-view/schema-view/components/component-config.js`。

### schema-form 控件扩展

1. 在  `app/widgets/schema-form/complex-view` 下写控件；
2. 添加控件配置文件`app/widgets/schema-form/form-item-config.js。`

### schema-search-bar 控件扩展

1. 在  `app/widgets/schema-search-bar/complex-view` 下写控件；
2. 添加控件配置文件`app/widgets/schema-search-bar/search-item-config.js。`

### header-container 控件扩展

1. 在  `app/widgets/header-container/complex-view` 下写控件；
2. 添加控件配置文件`app/widgets/header-container/search-item-config.js。`