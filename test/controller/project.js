const assert = require('assert');
const supertest = require('supertest');
const md5 = require('md5');
const saraCore = require('../../sara-core');

const signKey = 'fjoq23uj90JW0J039JFWJ3J3J032JFVXER';
const st = Date.now();

describe('测试 project 相关接口', function() {
  this.timeout(60000);

  let modelList;
  let projectList = [];
  let request;

  it('启动服务', async() => {
    const app = await saraCore.start();

    modelList = require('../../model/index')(app);
    modelList.forEach((modelItem) => {
      const { project } = modelItem;
      for(const pKey in project) {
        projectList.push(project[pKey]);
      }
    })

    request = supertest(app.listen());
  })

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