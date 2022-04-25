module.exports = () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.isBoom) {
      ctx.status = err.output.statusCode;
      ctx.body = { error: err.output.payload.message };
    } else {
      ctx.status = err.status || 500;

      if (err.status === 401) {
        ctx.body = { error: 'JWT无效，JWT空位或者JWT过期了' };
      } else {
        ctx.body = {
          error: err.message || '内部服务器错误',
        };
      }
    }

    ctx.app.emit('error', err, ctx);
  }
};
