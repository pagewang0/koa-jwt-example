const Router = require('koa-router');
const controllers = require('./controllers');

const router = new Router({ prefix: '/api/v2' });

router.post('/auth/register', controllers.users.register);
router.post('/auth/login', controllers.users.login);
router.get('/users/me', controllers.users.me);
router.get('/users/:id', controllers.users.read);

router.post('/posts', controllers.posts.create);
router.get('/posts', controllers.posts.list);
router.get('/posts/:id', controllers.posts.read);
router.patch('/posts/:id', controllers.posts.update);

router.get('/users/me/posts', controllers.users.my_posts);
router.get('/users/:id/posts', controllers.users.posts);

module.exports = router;
