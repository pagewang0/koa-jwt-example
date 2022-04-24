const supertest = require('supertest');
const faker = require('faker');
const _ = require('lodash');
const mongoose = require('mongoose');
const { assert } = require('chai');

const app = require('../../app');
const config = require('../../config');
const utils = require('../../utils');
const models = require('../../models');
const common = require('./common');

const request = supertest(app.listen());

describe('users', () => {
  after(async () => {
    await models.users.deleteMany({});
  });

  const payload = {
    name: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  const keys = ['name', 'email'];

  it('register 200', async () => {
    const res = await common.register(request, payload);

    const { _id: uid } = await utils.jwt_verify(res.body.token, config.jwt.secret);

    const user = await models.users.findById(uid);

    assert.deepEqual(_.pick(payload, keys), _.pick(user, keys));
  });

  it('register 400', async () => {
    const res = await request.post('/api/v2/auth/register')
      .expect(400);

    assert.equal(res.body.error, '用户名或邮箱不正确');
  });

  it('register 400 name or email has used', async () => {
    const res = await request.post('/api/v2/auth/register')
      .send(payload)
      .expect(400);

    assert.equal(res.body.error, '用户名或邮箱已被占用');
  });

  it('login 200', async () => {
    const res = await request.post('/api/v2/auth/login')
      .send(_.pick(payload, ['email', 'password']))
      .expect(200);

    const { _id: uid } = await utils.jwt_verify(res.body.token, config.jwt.secret);

    const user = await models.users.findById(uid);

    assert.deepEqual(_.pick(payload, keys), _.pick(user, keys));

    payload.token = res.body.token;
  });

  it('login 400', async () => {
    const res = await request.post('/api/v2/auth/login')
      .expect(400);

    assert.equal(res.body.error, '用户名或密码不正确');
  });

  it('login 400 wrong email', async () => {
    const res = await request.post('/api/v2/auth/login')
      .send({
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
      .expect(400);

    assert.equal(res.body.error, '用户名或密码不正确');
  });

  it('login 400 wrong password', async () => {
    const res = await request.post('/api/v2/auth/login')
      .send(_.assign({}, payload, { password: faker.internet.password() }))
      .expect(400);

    assert.equal(res.body.error, '用户名或密码不正确');
  });

  it('me 200', async () => {
    const res = await request.get('/api/v2/users/me')
      .set('authsessiontoken', payload.token)
      .expect(200);

    const { _id: uid } = await utils.jwt_verify(payload.token, config.jwt.secret);

    assert.equal(uid, res.body.id);
    assert.deepEqual(_.pick(payload, keys), _.pick(res.body, keys));

    payload.id = res.body.id;
  });

  it('me 400', async () => {
    const fakeToken = await utils.jwt_sign({ _id: 'test' }, config.jwt.secret);
    const res = await request.get('/api/v2/users/me')
      .set('authsessiontoken', fakeToken);

    assert.equal(res.body.error, '用户id无效');
  });

  it('me 401', async () => {
    const res = await request.get('/api/v2/users/me');

    assert.equal(res.body.error, 'JWT无效，JWT空位或者JWT过期了');
  });

  it('me 404', async () => {
    const fakeToken = await utils.jwt_sign(
      { _id: mongoose.Types.ObjectId() },
      config.jwt.secret,
    );

    const res = await request.get('/api/v2/users/me')
      .set('authsessiontoken', fakeToken);

    assert.equal(res.body.error, '用户不存在');
  });

  it('users read by id 200', async () => {
    const res = await request.get(`/api/v2/users/${payload.id}`)
      .set('authsessiontoken', payload.token)
      .expect(200);

    const { _id: uid } = await utils.jwt_verify(payload.token, config.jwt.secret);

    assert.equal(uid, res.body.id);
    assert.deepEqual(_.pick(payload, 'name'), _.pick(res.body, 'name'));
  });

  it('users read by id 400', async () => {
    const fakeId = 'test';
    const res = await request.get(`/api/v2/users/${fakeId}`)
      .set('authsessiontoken', payload.token)
      .expect(400);

    assert.equal(res.body.error, '用户id无效');
  });

  it('users read by id 404', async () => {
    const fakeId = mongoose.Types.ObjectId();

    const res = await request.get(`/api/v2/users/${fakeId}`)
      .set('authsessiontoken', payload.token)
      .expect(404);

    assert.equal(res.body.error, '用户不存在');
  });
});
