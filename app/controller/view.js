module.exports = (app) => {
  return class viewController {
    /**
     *  渲染页面
     * @param {object} ctx 上下文 
     */
    async renderPage(ctx) {
      const { query, params } = ctx

      app.logger.info(`[ViewController] query: ${JSON.stringify(query)}`);
      app.logger.info(`[ViewController] params: ${JSON.stringify(params)}`);
      await ctx.render(`dist/entry.${ctx.params.page}`, {
        projKey: ctx.query?.proj_key,
        name: app.options?.name,
        env: app.env.get(),
        options: JSON.stringify(app?.options)
      });
    }
  }
}