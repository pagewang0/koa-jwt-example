const joi = require('joi');

const models = require('../models');
const proxy = require('../proxy');

exports.create = async (ctx) => {
  const { title, content } = ctx.request.body;
  const { user: { _id: uid } } = ctx.state;

  const schema = joi.object({
    title: joi.string().required(),
    content: joi.string().required(),
    creator: joi.string().hex().length(24).required(),
  });

  try {
    await schema.validateAsync({ title, content, creator: uid });
  } catch (error) {
    ctx.throw(400, '请求body的内容无效');
  }

  const post = await models.posts.create({ title, content, creator: uid });

  ctx.body = post.toJSON();
};

exports.list = async (ctx) => {
  const { page, count } = ctx.query;

  const schema = joi.object({
    page: joi.number().integer().min(1).max(10000)
      .required(),
    count: joi.number().integer().min(1).max(200)
      .required(),
  });

  try {
    await schema.validateAsync({ page, count });
  } catch (error) {
    ctx.throw(400, 'count/page无效');
  }

  const res = await proxy.posts.list({ page, count });

  ctx.body = res;
};

exports.read = async (ctx) => {
  const { id } = ctx.params;

  const schema = joi.object({
    id: joi.string().hex().length(24),
  });

  try {
    await schema.validateAsync({ id });
  } catch (error) {
    ctx.throw(400, '帖子id无效');
  }

  const post = await models.posts.findById(id);

  if (!post) {
    ctx.throw(404, '帖子不存在');
  }

  ctx.body = post.toJSON();
};

exports.update = async (ctx) => {
  const { id } = ctx.params;
  const { title, content } = ctx.request.body;

  const schema = joi.object({
    title: joi.string(),
    content: joi.string(),
    id: joi.string().hex().length(24).required(),
  });

  try {
    await schema.validateAsync({ id });
  } catch (error) {
    ctx.throw(400, '帖子id无效');
  }

  const payload = {};

  if (title) {
    payload.title = title;
  }

  if (content) {
    payload.content = content;
  }

  const res = await models.posts.findByIdAndUpdate(id, payload, { new: true });

  if (!res) {
    ctx.throw(404, '帖子不存在');
  }

  ctx.body = res.toJSON();
};
