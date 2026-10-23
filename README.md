# Sara
一个企业级应用框架，集成了企业级后台应用的前后端的基本能力，通过自定义 dsl 配置可进行快速开发，同时通过继承的思想，对配置提供了一定的应用功能扩展能力。

关于该框架的部份设计思路：[请点击这里](https://juejin.cn/post/7462658386007228451)

### 服务端启动

在根目录下创建一个服务端入口文件，如 `server.js`，然后如下所示添加启动逻辑。

```js
// server.js

const { 
  serverStart
} = require('@eastonshay/sara')

const app = serverStart({});
```

### 添加服务端能力

业务能力以 Nest Module 的形式编写，放在使用方仓库的 `app/modules/**/*.module.ts`，编译到 `dist/modules/` 后由框架自动扫描挂载（详见下方「Part2」）。
框架内部的 Koa 路由、controller、service 已全部移除。

### 前端构建

在根目录下创建一个前端入口文件，如 `build.js`，然后如下所示添加启动逻辑。

```js
// build.js

const { 
  frontendBuild
} = require('@eastonshay/sara')

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
## Vite 构建（Part1）

前端构建器已从 webpack 切换为 Vite，入口文件仍为 `build.js` 中的 `frontendBuild(env)`，签名不变。

### 双终端启动

终端 1：前端开发服务（Vite，9002）

```js
// build.js
const { frontendBuild } = require('@eastonshay/sara')

frontendBuild('local'); // 启动 Vite dev server，监听 http://127.0.0.1:9002
```

终端 2：服务端（8080），读取 `.tpl` 页面

```js
// server.js
const { serverStart } = require('@eastonshay/sara')

serverStart({});
```

生产构建：`frontendBuild('prod')` 调用 `vite.build()`，产物输出到 `app/public/dist/prod/`（`js/`、`css/`），并生成带 `/dist/prod/` 路径的 `.tpl`。

### npm link 流程

在框架仓库（本仓库）根目录执行一次：

```bash
npm link
```

然后在使用方（demo 项目）根目录执行：

```bash
npm link @eastonshay/sara
```

Vite 的 root 是使用方的 cwd，框架目录在 root 之外，因此 dev 下框架入口通过 `/@fs/绝对路径` 访问，`server.fs.allow` 已放行框架包根与 cwd。

### 与 webpack 1.0 的差异

| 项目 | webpack 1.0 | Vite（Part1） |
|------|-------------|---------------|
| 入口 API | `frontendBuild(env)` | 签名不变，内部改为 `app/vite/dev.js` / `prod.js` |
| 多入口扫描 | 框架 + 业务两棵树的 `entry.*.js` | 同：两棵树合并后作为 `rollupOptions.input` |
| dev 服务 | 独立 Express，9002 | `vite.createServer`，9002，同一进程内启动 |
| dev `.tpl` 资源 | `http://127.0.0.1:9002/...` | 同：绝对 URL（`@vite/client` 与入口模块） |
| prod `.tpl` 资源 | `/dist/prod/js/...` | 同：`/dist/prod/css/...` 与 `/dist/prod/js/...`（`base: '/dist/prod/'`） |
| prod 产物目录 | `js/`、`css/` | 对齐为 `js/`、`css/`；其他资源留在 `assets/` |
| 公共代码拆分 | `splitChunks`（vendor / common / runtime） | `manualChunks`（vendor / common），未复刻 `minChunks` 与 runtime 分离 |
| 生产压缩 | `drop_console` | `esbuild.drop: ['console', 'debugger']` |
| 全局注入 | `ProvidePlugin`（Vue、axios、_lodash） | 无全局注入，需在使用处显式 `import` |
| 业务扩展缺失 | 不存在的文件回退 `blank.js`（CJS） | 回退 `app/vite/libs/blank.js`（ESM，`export default {}`） |
| 不支持的 env | `frontendBuild` 只处理 `local` / `prod` | 同：`beta` 等其他值无操作（沿用原行为） |

### Part1 完成 checklist

- [x] `app/webpack/` 目录已删除（可从 git 历史恢复）
- [x] webpack 生态依赖已从 `package.json` 移除，`vite`、`@vitejs/plugin-vue`、`@babel/runtime` 保留
- [x] `index.js` 的 `frontendBuild` 仅指向 `app/vite/dev.js` / `app/vite/prod.js`
- [x] dev：`/@vite/client` 与 dashboard 入口在 9002 返回 200
- [x] prod：`vite.build()` 成功，tpl 写入 `/dist/prod/` 绝对路径
- [ ] dev HMR 日志（需修改源文件后在终端确认）
- [ ] 8080 dashboard 全链路 CRUD（M7）
- [ ] 登录页、dashboard 页面在浏览器中的完整验证
- [ ] 双终端脚本名（如 `build:dev` / `dev`）与 demo 实际脚本对齐

## Nest 内核（Part2）

Koa 内核已删除，框架 HTTP 层统一使用 NestJS 12。对外 API（`serverStart` / `frontendBuild`、路径、返回格式、442 / 445 / 446）与 1.0 保持一致。

### 成果

- `serverStart()` 通过 `NestFactory` 拉起服务，默认监听 8080；`frontendBuild()` 签名不变
- 横切能力按 1.0 挂载：`ApiSignGuard`（验签，445）、`ProjKeyInterceptor`（proj_key，446）、`ValidationPipe`（参数校验，442）、`AllExceptionsFilter`（50000 / 302）
- 业务模块自动扫描：`SaraModule.register()` 扫描 `process.cwd()/dist/modules/**/*.module.js`，不在框架源码里写死业务类
- 静态资源：`NestFactory.create` 之后直接挂 `express.static`，`app/public` 框架与业务各一份
- 删除：`sara-core/`（旧 Koa 内核）、`app/controller|router|router-schema|service|middleware|extend|middlewares`（旧 Koa 业务）、`app/webpack/`、无关遗留脚本

### 顶层目录梳理

| 路径 | 说明 |
|------|------|
| `index.js` | 对外入口：`serverStart`、`frontendBuild` |
| `app/main.ts` | `createApp`（横切装配，不监听）与 `bootstrap`（监听） |
| `app/app.module.ts` | 根模块：只收 `ConfigModule` + `SaraModule.register()` |
| `app/sara.module.ts` | 框架模块：`Extend / Project / View / 扫描到的业务模块 / Fallback` |
| `app/common/` | 横切件：guards、filters、interceptors、pipes、middleware（静态）、fallback |
| `app/config/` | `ConfigService`、`BOOTSTRAP_OPTIONS` |
| `app/extend/` | 数据库、日志 provider |
| `app/modules/` | 框架自带模块：`project`、`view` |
| `app/types/` | 类型契约，`express.d.ts` 为 `Request.projKey` 增强 |
| `app/pages/`、`app/vite/`、`app/public/`、`app/view/` | 前端工程与 `.tpl` 模板 |
| `config/` | 框架默认配置 |
| `model/` | model / project 配置加载器 |
| `test/` | `npm test` 正式回归（依赖同级 `elpis-demo`，不存在则 skip） |
| `dist/` | 编译产物（git 忽略，由 `nest build` / `tsc` 生成） |
| `app/ai/` | Part3 预留（Agent / LLM），本 Part 不实现 |

### 双终端启动（使用方 demo）

| 终端 | 命令 | 作用 |
|------|------|------|
| A | `npm run build:dev` | 前端 Vite dev server，9002 |
| B | `npm run dev` | 先 `build:modules` 编译业务模块，再以 watch 启动服务端，8080 |

生产：`npm run prod`（先编译业务模块，再以 `production` 启动）。
