const models = require('../models');

exports.list = async (opts) => {
  const { page, count, uid } = opts;

  const cond = {};

  if (uid) {
    cond.creator = uid;
  }

  const posts = await models.posts.find(cond)
    .skip((page - 1) * count)
    .limit(count)
    .sort({ created_at: -1 });

  return posts.map((post) => post.toJSON());
};
