/**
 * api 签名合法性校验
 * @param {*} app 
 */
module.exports = (app) => {
  const md5 = require('md5');

  return async (ctx, next) => {
    // 校验白名单
    if(app.config?.apiSignVerify.whiteList.includes(ctx.path)) {
      return await next();
    }

    // 只对 api 请求签名校验
    if (ctx.path.indexOf('/api') < 0) {
      return await next();
    }

    const { path, method } = ctx;
    const { headers } = ctx.request;
    const { s_sign: sSign, s_t: st } = headers;

    const signKey = 'fjoq23uj90JW0J039JFWJ3J3J032JFVXER';
    const signature = md5(`${signKey}_${st}`);
    app.logger.info(`[${method} ${path}] signature: ${signature}`);

    if(!sSign || !st || signature !== sSign.toLowerCase() || Date.now() - st > 600 * 1000) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        message: 'signature not correct or api timeout',
        code: 445
      }
      return;
    }

    await next();
  }
}
