const config = require('../config');
const utils = require('../utils');

exports.get_token = async (ctx, id, expire) => {
  let token;

  try {
    token = await utils.jwt_sign({ _id: id }, config.jwt.secret, expire);
  } catch (error) {
    ctx.throw(400, '签发JWT失败');
  }

  return token;
};
