const supertest = require('supertest');
const faker = require('faker');
const _ = require('lodash');
const Promise = require('bluebird');
const { assert } = require('chai');
const mongoose = require('mongoose');

const app = require('../../app');
const common = require('./common');
const models = require('../../models');
const utils = require('../../utils');
const config = require('../../config');

const request = supertest(app.listen());

describe('posts', () => {
  let token;

  before(async () => {
    const res = await common.register(request, {
      name: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    token = res.body.token;

    await Promise.each(_.range(2), () => common.create_post(request, {
      token,
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
    }));
  });

  after(async () => {
    await models.users.deleteMany({});
    await models.posts.deleteMany({});
  });

  const payload = {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
  };

  it('posts create 200', async () => {
    const res = await common.create_post(request, _.assign({}, payload, { token }));

    const { _id: uid } = await utils.jwt_verify(token, config.jwt.secret);

    assert.equal(uid, res.body.creator);
    assert.deepEqual(payload, _.pick(res.body, ['title', 'content']));

    payload.id = res.body.id;
  });

  it('posts create 400', async () => {
    const res = await request.post('/api/v2/posts')
      .set('authsessiontoken', token)
      .send(_.pick(payload, ['title']))
      .expect(400);

    assert.equal(res.body.error, '请求body的内容无效');
  });

  const qs = { page: 1, count: 10 };

  it('posts list 200', async () => {
    const res = await request.get('/api/v2/posts')
      .set('authsessiontoken', token)
      .query(qs)
      .expect(200);

    assert.isTrue(res.body.every((d, i) => i === 0
    || d.created_at <= res.body[i - 1].created_at)); // desc
  });

  it('posts list 400', async () => {
    const res = await request.get('/api/v2/posts')
      .set('authsessiontoken', token)
      .expect(400);

    assert.equal(res.body.error, 'count/page无效');
  });

  it('posts me 200', async () => {
    const res = await request.get('/api/v2/users/me/posts')
      .set('authsessiontoken', token)
      .query(qs)
      .expect(200);

    assert.isTrue(res.body.every((d, i) => i === 0
      || d.created_at <= res.body[i - 1].created_at)); // desc

    payload.uid = res.body[0].creator;
  });

  it('posts me 400', async () => {
    const res = await request.get('/api/v2/users/me/posts')
      .set('authsessiontoken', token)
      .query(_.pick(qs, ['page']))
      .expect(400);

    assert.equal(res.body.error, 'count/page无效');
  });

  it('posts users by uid 200', async () => {
    const res = await request.get(`/api/v2/users/${payload.uid}/posts`)
      .set('authsessiontoken', token)
      .query(qs)
      .expect(200);

    assert.isTrue(res.body.every((d, i) => i === 0
      || d.created_at <= res.body[i - 1].created_at)); // desc
  });

  it('posts users by uid 400', async () => {
    const res = await request.get(`/api/v2/users/${payload.uid}/posts`)
      .set('authsessiontoken', token)
      .query(_.pick(qs, ['page']))
      .expect(400);

    assert.equal(res.body.error, '用户id无效/count无效/page无效');
  });

  it('posts read 200', async () => {
    const res = await request.get(`/api/v2/posts/${payload.id}`)
      .set('authsessiontoken', token)
      .expect(200);

    const keys = ['title', 'content', 'id'];

    assert.deepEqual(_.pick(payload, keys), _.pick(res.body, keys));
  });

  it('posts read 400', async () => {
    const fakeId = 'test';

    const res = await request.get(`/api/v2/posts/${fakeId}`)
      .set('authsessiontoken', token)
      .expect(400);

    assert.equal(res.body.error, '帖子id无效');
  });

  it('posts read 404', async () => {
    const fakeId = mongoose.Types.ObjectId();
    const res = await request.get(`/api/v2/posts/${fakeId}`)
      .set('authsessiontoken', token)
      .expect(404);

    assert.equal(res.body.error, '帖子不存在');
  });

  const newPayload = {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
  };

  it('posts update 200', async () => {
    const res = await request.patch(`/api/v2/posts/${payload.id}`)
      .set('authsessiontoken', token)
      .send(newPayload);

    assert.deepEqual(newPayload, _.pick(res.body, ['title', 'content']));
  });

  it('posts update 400', async () => {
    const fakeId = 'test';
    const res = await request.patch(`/api/v2/posts/${fakeId}`)
      .set('authsessiontoken', token)
      .expect(400);

    assert.equal(res.body.error, '帖子id无效');
  });

  it('posts update 404', async () => {
    const fakeId = mongoose.Types.ObjectId();
    const res = await request.patch(`/api/v2/posts/${fakeId}`)
      .set('authsessiontoken', token)
      .send(newPayload)
      .expect(404);

    assert.equal(res.body.error, '帖子不存在');
  });
});
