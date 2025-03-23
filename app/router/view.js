module.exports = (app, router) => {
  const { view: viewController } = app.controller;

  // 当用户输入 http://ip:port/view/xxx 能渲染出对应路径
  router.get('/view/:page', viewController.renderPage.bind(viewController));

   // 当用户输入 http://ip:port/view/xxx 能渲染出对应路径
  router.get('/view/:page/*', viewController.renderPage.bind(viewController));
}