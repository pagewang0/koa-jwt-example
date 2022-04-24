const Koa = require('koa');
const bodyParser = require('koa-body');
const jwt = require('koa-jwt');

const middleware = require('./middleware');
const routers = require('./routers');
const config = require('./config');

require('./models');

const app = new Koa();

module.exports = app;

app.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('sent error %s to the cloud', err.message);
    console.log(err);
  }
});

app.use(middleware.error_handle());

app.use(jwt({
  secret: config.jwt.secret,
  getToken: (ctx) => ctx.header.authsessiontoken,
})
  .unless({ path: [...config.jwt.unless] }));

app.use(bodyParser());

app.use(routers.routes())
  .use(routers.allowedMethods());

if (!module.main) {
  app.listen(process.env.NODE_PORT || 8081, function log() {
    console.info(`server start on ${this.address().port}`);
  });
}
