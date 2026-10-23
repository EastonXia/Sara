const assert = require('assert');
const fs = require('fs');
const path = require('path');
const supertest = require('supertest');
const md5 = require('md5');

// 同级的 elpis-demo 提供 model 与业务模块；不存在则整组用例 skip
const demoDir = path.resolve(__dirname, '../../../elpis-demo');

const signKey = 'fjoq23uj90JW0J039JFWJ3J3J032JFVXER';
const st = Date.now();

describe('测试 project 相关接口', function() {
  this.timeout(60000);

  let projectList = [];
  let request;
  let app;
  let prevCwd;

  before(async function() {
    if(!fs.existsSync(demoDir)) {
      this.skip();
    }

    // 业务配置、dist/modules 扫描、model 都以 process.cwd() 为准，所以切到 demo 目录
    prevCwd = process.cwd();
    process.chdir(demoDir);

    // createApp 只挂好横切能力、不 listen，避免占用 8080
    const { createApp } = require('../../dist/main');
    app = await createApp({ name: 'ElpisDemo', homePage: '/view/project-list' });
    await app.init();

    const loadModelList = require('../../model/index');
    loadModelList({ baseDir: demoDir }).forEach((modelItem) => {
      const { project } = modelItem;
      for(const pKey in project) {
        projectList.push(project[pKey]);
      }
    });

    // demo 的 AuthTokenGuard 全局生效：先登录拿 token cookie，agent 会保存并在后续请求中自动带上
    request = supertest.agent(app.getHttpServer());
    const loginRes = await request
      .post('/api/auth/login')
      .set('s_t', st)
      .set('s_sign', md5(`${signKey}_${st}`))
      .send({ username: 'test', password: 'test' });
    assert(loginRes.body.success === true);
  });

  after(async function() {
    if(app) {
      await app.close();
    }
    if(prevCwd) {
      process.chdir(prevCwd);
    }
  });

  it('GET /api/project without proj_key', async () => {
    let temRequest = request.get('/api/project');
    temRequest = temRequest.set('s_t', st);
    temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
    const res = await temRequest;
    assert(res.body.success === false);

    const resBody = res.body;
    assert(resBody.code === 442);
    assert(resBody.message.indexOf("request validate fail: data should have required property 'proj_key'") > -1);
  });

  it('GET /api/project fail', async () => {
    let temRequest = request.get('/api/project');
    temRequest = temRequest.set('s_t', st);
    temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
    temRequest = temRequest.query({ proj_key: 'xxxxxxx' });
    const res = await temRequest;
    assert(res.body.success === false);

    const resBody = res.body;
    assert(resBody.code === 50000);
    assert(resBody.message.indexOf("获取项目异常") > -1);
  });

  it('GET /api/project with proj_key', async () => {
    for(let i = 0; i < projectList.length; i++) {
      const projItem = projectList[i];
      const { key: projKey } = projItem;

      console.log(`----------- get /api/project with proj_key: ${projKey}`);

      let temRequest = request.get('/api/project');
      temRequest = temRequest.set('s_t', st);
      temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
      temRequest = temRequest.query({ proj_key: projKey });
      const res = await temRequest;
      assert(res.body.success === true);

      const resData = res.body.data;
      assert(resData.key === projKey);
      assert(resData.modelKey);
      assert(resData.name);
      assert(resData.desc !== undefined);
      assert(resData.homePage !== undefined);

      const { menu } = resData;
      menu.forEach((menuItem) => {
        checkMenuItem(menuItem);
      });
    }

    // 递归校验 menu 菜单
    function checkMenuItem(menuItem) {
      console.log('----------- get /api/project with proj_key -- menuItem key', menuItem.key);
      
      assert(menuItem.key);
      assert(menuItem.name);
      assert(menuItem.menuType);

      if(menuItem.menuType === 'group') {
        assert(menuItem.subMenu !== undefined);
        menuItem.subMenu.forEach((subMenuItem) => {
          checkModule(subMenuItem);
        });
      }

      if(menuItem.menuType === 'module') {
        checkModule(menuItem);
      }
    }

    // 检查 module 菜单配置
    function checkModule(moduleItem) {
      const { moduleType } = moduleItem;
      assert(moduleType);

      if(moduleType === 'sider') {
        const { siderConfig } = moduleItem;
        assert(siderConfig);
        assert(siderConfig.menu);
        siderConfig.menu.forEach((menuItem) => {
          checkMenuItem(menuItem);
        });
      }

      if(moduleType === 'iframe') {
        const { iframeConfig } = moduleItem;
        assert(iframeConfig);
        assert(iframeConfig.path !== undefined);
      }

      if(moduleType === 'custom') {
        const { customConfig } = moduleItem;
        assert(customConfig);
        assert(customConfig.path !== undefined);
      }

      if(moduleType === 'schema') {
        const { schemaConfig } = moduleItem;
        assert(schemaConfig);
        assert(schemaConfig.api !== undefined);
        assert(schemaConfig.schema);
      }
    }
  });

  it('GET /api/project/list without proj_key', async () => {
    let temRequest = request.get('/api/project/list');
    temRequest = temRequest.set('s_t', st);
    temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
    const res = await temRequest;
    assert(res.body.success === true);

    const resData = res.body.data;
    assert(resData.length === projectList.length);
    for(let i = 0; i < resData.length; i++){
      const item = resData[i];
      assert(item.modelKey);
      assert(item.key);
      assert(item.name);
      assert(item.desc !== undefined);
      assert(item.homePage !== undefined);
    }
  });

  it('GET /api/project/list with proj_key', async () => {
    const projKey = projectList[Math.floor(Math.random() * projectList.length)].key;
    const { modelKey } = projectList.find((item) => item.key === projKey);

    console.log(`----------- get /api/project/list with proj_key: ${projKey}`);

    let temRequest = request.get('/api/project/list');
    temRequest = temRequest.set('s_t', st);
    temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
    temRequest = temRequest.query({ proj_key: projKey });
    const res = await temRequest;
    assert(res.body.success === true);

    const resData = res.body.data;
    assert(projectList.filter((item) => item.modelKey === modelKey).length === resData.length);

    for(let i = 0; i < resData.length; i++){
      const item = resData[i];
      assert(item.modelKey);
      assert(item.key);
      assert(item.name);
      assert(item.desc !== undefined);
      assert(item.homePage !== undefined);
    }
  });

  it('GET /api/project/model_list', async() => {
    let temRequest = request.get('/api/project/model_list');
    temRequest = temRequest.set('s_t', st);
    temRequest = temRequest.set('s_sign', md5(`${signKey}_${st}`));
    const res = await temRequest;

    assert(res.body.success === true);

    const resData = res.body.data;
    assert(resData.length > 0);

    for(let i = 0; i < resData.length; i++) {
      const item = resData[i];
      assert(item.model);
      assert(item.model.key);
      assert(item.model.name);
      assert(item.project)

      for(const projKey in item.project) {
        assert(item.project[projKey].key);
        assert(item.project[projKey].name);
      }
    }
  });
})