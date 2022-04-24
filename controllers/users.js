const joi = require('joi');
const _ = require('lodash');

const models = require('../models');
const utils = require('../utils');
const proxy = require('../proxy');

exports.register = async (ctx) => {
  const { name, email, password } = ctx.request.body;

  const schema = joi.object({
    name: joi.string().required().max(48),
    password: joi.string().required().min(4).max(48),
    email: joi.string().email().required(),
  });

  try {
    await schema.validateAsync({ name, email, password });
  } catch (error) {
    ctx.throw(400, '用户名或邮箱不正确或者签发JWT失败');
  }

  const user = await models.users.findOne({ $or: [{ name }, { email }] });

  if (user) {
    ctx.throw(400, '用户名或邮箱已被占用');
  }

  const { users: Users } = models;

  const salt = Math.floor(Math.random() * 9999).toString(16);
  const encode = utils.md5(password, salt);

  const newUser = new Users({
    name,
    email,
    password: encode,
    salt,
  });

  await newUser.save();

  const token = await proxy.users.get_token(ctx, newUser._id);

  ctx.body = { token };
};

exports.login = async (ctx) => {
  const { email, password } = ctx.request.body;
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required().min(4).max(48),
  });

  try {
    await schema.validateAsync({ email, password });
  } catch (error) {
    ctx.throw(400, '用户名或密码不正确或者签发JWT失败');
  }

  const user = await models.users.findOne({ email }, { password: 1, salt: 1 });

  if (!user) {
    ctx.throw(400, '用户名或密码不正确或者签发JWT失败');
  }

  const encode = utils.md5(password, user.salt);

  if (encode !== user.password) {
    ctx.throw(400, '用户名或密码不正确或者签发JWT失败');
  }

  const token = await proxy.users.get_token(ctx, user._id);

  ctx.body = { token };
};

const getUser = async (ctx, id, exclude = {}) => {
  const schema = joi.object({
    id: joi.string().hex().length(24),
  });

  try {
    await schema.validateAsync({ id });
  } catch (error) {
    ctx.throw(400, '用户id无效');
  }

  const user = await models.users.findById(id, _.assign({ password: 0, salt: 0 }, exclude));

  if (!user) {
    ctx.throw(404, '用户不存在');
  }

  ctx.body = user;
};

exports.me = async (ctx) => {
  const { _id: id } = ctx.state.user;

  await getUser(ctx, id);
};

exports.read = async (ctx) => {
  const { id } = ctx.params;

  await getUser(ctx, id, { email: 0 });
};

exports.my_posts = async (ctx) => {
  const { _id: id } = ctx.state.user;
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

  await proxy.posts.list(ctx, { page, count, uid: id });
};

exports.posts = async (ctx) => {
  const { id } = ctx.params;
  const { page, count } = ctx.query;

  const schema = joi.object({
    id: joi.string().hex().length(24),
    page: joi.number().integer().min(1).max(10000)
      .required(),
    count: joi.number().integer().min(1).max(200)
      .required(),
  });

  try {
    await schema.validateAsync({ page, count, id });
  } catch (error) {
    ctx.throw(400, '用户id无效/count无效/page无效');
  }

  await proxy.posts.list(ctx, { page, count, uid: id });
};
